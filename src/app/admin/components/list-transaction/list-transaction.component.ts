import { Transaction } from '@transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { TransactionService } from '@transactions/services/transaction.service';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';
import { TransactionComponent } from '@transactions/components/transaction/transaction.component';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-list-transaction',
  standalone: true,
  imports: [TransactionComponent, CommonModule, NavbarAdminComponent, RouterModule],
  templateUrl: './list-transaction.component.html',
  styleUrl: './list-transaction.component.css'
})
export class ListTransactionComponent implements OnInit {

  id: number = 0;
  flag: boolean = false;
  coming = false;
  pageSize = 4;
  currentPage = 1;
  destinatario: string = '';
  transactions: Array<Transaction> = [];

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        this.id = Number(params.get('id'));
        this.transactionService.getTransactionsByAccountId(this.id).subscribe({
          next: (transactions) => {
            this.transactions = transactions;
          },
          error: (e: Error) => {
            this.router.navigate(['/not-found']);
            console.error('Error al cargar transacciones:', e);
          }
        })
      },
      error: (e: Error) => {
        this.router.navigate(['/not-found']);
        console.error('Error al cargar transacciones:', e);      }
    })
  }

  toggleFlag(): void {
    this.flag = !this.flag;
  }

  onCancel(): void {
    this.flag = false;
  }

  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.pageSize);
  }

  get paginatedTransactions() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.transactions.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openedTransactionId: number | undefined = undefined;

  toggleReceipt(transactionId: number|undefined): void {
    this.openedTransactionId = this.openedTransactionId === transactionId ? undefined : transactionId;
  }
  
  isReceiptOpen(transactionId: number|undefined): boolean {
    return this.openedTransactionId === transactionId;
  }
}
