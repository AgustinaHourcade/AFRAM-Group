import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { catchError, Observable, of } from 'rxjs';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { Loan } from '../../interface/loan';
import { LoanService } from '../../service/loan.service';

@Component({
  selector: 'app-list-loan',
  standalone: true,
  imports: [NavbarComponent, RouterLink],
  templateUrl: './list-loan.component.html',
  styleUrl: './list-loan.component.css'
})
export class ListLoanComponent {

  loans: Array<Loan> = [];
  accounts: Array<Account> = [];
  userId: number = 0;

  loanService = inject(LoanService);
  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  
  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    this.loadAccounts();
  }
  
  loadAccounts(){
    this.accountService.getAccountsByIdentifier(Number(this.userId)).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        for (let account of this.accounts) {
          this.loanService.getLoanByAccountId(account.id).subscribe({
            next: (loan: Loan[]) => {
              this.loans.push(...loan);
            },
            error: (error: Error) => {
              console.error(`Error loading loans for account ${account.id}:`,error);
            },
          });
        }
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }

  formatearFecha(date : string){
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

}