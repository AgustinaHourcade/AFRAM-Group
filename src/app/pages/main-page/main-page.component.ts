import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CardAccountComponent } from '../../accounts/components/card-account/card-account.component';
import { TransactionComponent } from '../../transactions/components/transaction/transaction.component';
import { AccountService } from '../../accounts/services/account.service';
import { UserSessionService } from '../../auth/services/user-session.service';
import { TransactionService } from '../../transactions/services/transaction.service';
import { Transaction } from '../../transactions/interface/transaction.interface';
import { NgFor, NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { Account } from '../../accounts/interface/account.intarface';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    NavbarComponent,
    CardAccountComponent,
    TransactionComponent,
    NgFor,
    NgForOf,
  ],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})

export class MainPageComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Array<Transaction> = [];
  userId: number = 0;
  showActions = false;

  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    console.log('ACAAAAAAAA'+ this.userId);

    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        console.log(this.accounts);
        for (let a of accounts) {
          this.loadTransactions(a.id).subscribe({
            next: (transactions: Transaction[]) => {
              this.transactions.push(...transactions);
            },
            error: (error: Error) => {
              console.error(
                `Error loading transactions for account ${a.id}:`,
                error
              );
            },
          });
        }
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }

  private loadTransactions(accountId: number): Observable<Transaction[]> {
    return this.transactionService.getTransactionsByAccountId(accountId).pipe(
      catchError((error: Error) => {
        console.error(
          `Error loading transactions for account ${accountId}:`,
          error
        );
        return of([]);
      })
    );
  }

  toggleActions(div: HTMLDivElement) {
    div.style.display = this.showActions ? 'flex' : 'none';
    this.showActions = !this.showActions;
  }
}
