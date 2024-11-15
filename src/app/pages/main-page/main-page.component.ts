import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CardAccountComponent } from '../../accounts/components/card-account/card-account.component';
import { TransactionComponent } from '../../transactions/components/transaction/transaction.component';
import { AccountService } from '../../accounts/services/account.service';
import { UserSessionService } from '../../auth/services/user-session.service';
import { TransactionService } from '../../transactions/services/transaction.service';
import { Transaction } from '../../transactions/interface/transaction.interface';
import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { Account } from '../../accounts/interface/account.interface';
import { Observable, catchError, of } from 'rxjs';
import { Card } from '../../cards/interface/card';
import { CardService } from '../../cards/service/card.service';
import { DolarComponent } from "../../shared/dolar/components/dolar.component";

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NavbarComponent, CardAccountComponent, TransactionComponent, CommonModule, DolarComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})

export class MainPageComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Array<Transaction> = [];
  cards: Array<Card> = [];
  userId: number = 0;
  showActions = false;

  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  transactionService = inject(TransactionService);
  cardService = inject(CardService);

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();

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
              console.error(`Error loading transactions for account ${a.id}:`,error);
            },
          });
        }
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });

    this.cardService.getCardsById(this.userId).subscribe({
      next: (cards) =>{
        this.cards = cards
      },error: (error: Error) => {
        console.log(error.message)
      }})
  }

  private loadTransactions(accountId: number): Observable<Transaction[]> {
    return this.transactionService.getTransactionsByAccountId(accountId).pipe(
      catchError((error: Error) => {
        console.error (`Error loading transactions for account ${accountId}:`, error );
        return of([]);
      })
    );
  }

  toggleActions(div: HTMLDivElement) {
    div.style.display = this.showActions ? 'flex' : 'none';
    this.showActions = !this.showActions;
  }
}
