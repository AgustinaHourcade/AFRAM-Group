import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { Loan } from '../../interface/loan';
import { LoanService } from '../../service/loan.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-loan',
  standalone: true,
  imports: [NavbarComponent, RouterLink, CommonModule],
  templateUrl: './list-loan.component.html',
  styleUrl: './list-loan.component.css'
})
export class ListLoanComponent {

  loans: Array<Loan> = [];  
  expiredLoans: Array<Loan> = [];
  accounts: Array<Account> = [];
  userId: number = 0;

  private loanService = inject(LoanService);
  // private router = inject(Router);
  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);
  
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
            next: (loans: Loan[]) => {
              const today = new Date(); 
              
              loans.forEach(loan => {
                if (loan.paid !== loan.return_amount && new Date(loan.expiration_date) > today) {
                  this.loans.push(loan); 
                } else if (loan.paid === loan.return_amount || new Date(loan.expiration_date) <= today) {
                  this.expiredLoans.push(loan);
                }
              });
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

}