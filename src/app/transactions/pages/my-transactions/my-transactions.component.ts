import { Account } from '@accounts/interface/account.interface';
import { Transaction } from '@transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { Component, inject } from '@angular/core';
import { ChangeDetectorRef, OnInit } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { TransactionService } from '@transactions/services/transaction.service';
import { TransactionComponent } from '@transactions/components/transaction/transaction.component';
import { Observable, catchError, of } from 'rxjs';

@Component({
  selector: 'app-my-transactions',
  standalone: true,
  imports: [TransactionComponent, CommonModule, NavbarComponent],
  templateUrl: './my-transactions.component.html',
  styleUrl: './my-transactions.component.css',
})
export class MyTransactionsComponent implements OnInit {
  private changeDetector = inject(ChangeDetectorRef);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);
  private transactionService = inject(TransactionService);

  userId = 0;
  pageSize = 4 ;
  accounts: Account[] = [];
  transfers: Transaction[] = [];
  currentPage = 1;
  pendingTransfers: Transaction[] = [];
  selectedAccountId !: number;
  currentPagePending = 1;
  openedTransactionId: number | undefined = undefined;

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();

    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts.filter(account => account.closing_date === null);
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }

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

  get totalPagesP(): number {
    return Math.ceil(this.pendingTransfers.length / this.pageSize);
  }

  get paginatedTransactionsP() {
    const startIndex = (this.currentPagePending - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.pendingTransfers.slice(startIndex, endIndex);
  }

  changePageP(page: number): void {
    if (page >= 1 && page <= this.totalPagesP) {
      this.currentPagePending = page;
    }
  }

  private loadTransactions(accountId: number): Observable<Transaction[]> {
    return this.transactionService.getTransactionsByAccountId(accountId).pipe(
      catchError((error: Error) => {
        console.error(`Error loading transactions for account ${accountId}:`, error);
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
      error: (error: Error) => console.error(`Error loading transactions for account ${this.selectedAccountId}:`, error)
    });
  }


  toggleReceipt(transactionId: number|undefined): void {
    this.openedTransactionId = this.openedTransactionId === transactionId ? undefined : transactionId;
  }
  
  isReceiptOpen(transactionId: number|undefined): boolean {
    return this.openedTransactionId === transactionId;
  }

}
