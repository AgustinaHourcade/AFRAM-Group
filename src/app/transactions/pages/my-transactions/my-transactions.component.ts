import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Account } from '@accounts/interface/account.interface';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { Transaction } from '@transactions/interface/transaction.interface';
import { TransactionService } from '@transactions/services/transaction.service';
import { TransactionComponent } from '@transactions/components/transaction/transaction.component';
import { NavbarComponent } from '@shared/navbar/navbar.component';

@Component({
  selector: 'app-my-transactions',
  standalone: true,
  imports: [TransactionComponent, CommonModule, NavbarComponent],
  templateUrl: './my-transactions.component.html',
  styleUrl: './my-transactions.component.css',
})
export class MyTransactionsComponent {
  accounts: Array<Account> = [];
  transfers: Array<Transaction> = [];
  pendingTransfers: Array<Transaction> = [];
  userId: number = 0;
  pageSize = 4 ;
  currentPage = 1;

  //private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);
  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);
  private  transactionService = inject(TransactionService);
  selectedAccountId!: number;

  get totalPages(): number {
    return Math.ceil(this.transfers.length / this.pageSize);
  }

  get paginatedTransactions() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.transfers.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();

    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
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
    this.transfers = [];

    this.loadTransactions(this.selectedAccountId).subscribe({
      next: (transactions: Transaction[]) => {
        this.transfers = transactions.filter(transaction =>
          transaction.transaction_type === 'transfer' && transaction.is_paid === 'yes'
        );
        this.pendingTransfers = transactions.filter(transaction =>
          transaction.transaction_type === 'transfer' && transaction.is_paid === 'no'
        );
        this.changeDetector.detectChanges();
      }
      ,
      error: (error: Error) => {
        console.error(`Error loading transactions for account ${this.selectedAccountId}:`, error);
      },
    });
  }

}
