import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Transaction } from '../../interface/transaction.interface';
import { TransactionService } from '../../services/transaction.service';
import { TransactionComponent } from '../../components/transaction/transaction.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-my-transactions',
  standalone: true,
  imports: [TransactionComponent, CommonModule, NavbarComponent],
  templateUrl: './my-transactions.component.html',
  styleUrl: './my-transactions.component.css',
})
export class MyTransactionsComponent {
  accounts: Array<Account> = [];
  transactions: Array<Transaction> = [];
  userId: number = 0;
  router = inject(Router);
  
  changeDetector = inject(ChangeDetectorRef);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  transactionService = inject(TransactionService);
  selectedAccountId!: number;

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
  
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        console.log(this.accounts);
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

  onAccountSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const selectedAccountId = Number(target.value); 
      this.selectedAccountId = selectedAccountId;
      console.log('ID de la cuenta seleccionada:', selectedAccountId);
    }

    this.loadTransactions(this.selectedAccountId).subscribe({
      next: (transactions: Transaction[]) => {
        this.transactions = transactions;

        this.transactions = this.transactions.reverse();
  
        this.changeDetector.detectChanges();
      },
      error: (error: Error) => {
        console.error(`Error loading transactions for account ${this.selectedAccountId}:`, error);
      },
    });
  }

}
