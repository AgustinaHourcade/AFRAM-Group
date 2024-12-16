import { Loan } from '@loans/interface/loan';
import { Account } from '@accounts/interface/account.interface';
import { RouterLink } from '@angular/router';
import { LoanService } from '@loans/service/loan.service';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { Component, inject, OnInit } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-list-loan',
  standalone: true,
  imports: [NavbarComponent, RouterLink, CommonModule],
  templateUrl: './list-loan.component.html',
  styleUrl: './list-loan.component.css'
})
export class ListLoanComponent implements OnInit {
  private loanService = inject(LoanService);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);

  loans: Loan[] = [];
  userId: number = this.userSessionService.getUserId();
  accounts: Account[] = [];
  expiredLoans: Loan[] = [];

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(){
    this.accountService.getAccountsByIdentifier(Number(this.userId)).subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(account => account.closing_date == null);
        for (const account of this.accounts) {
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
            error: (error: Error) => console.error(`Error loading loans for account ${account.id}:`,error)
          });
        }
      },
      error: (error: Error) => console.error('Error fetching accounts:', error)
    });
  }
  
}
