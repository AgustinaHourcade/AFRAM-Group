import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Transaction } from '../../../transactions/interface/transaction.interface';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';
import { TransactionComponent } from '../../../transactions/components/transaction/transaction.component';

@Component({
  selector: 'app-list-transaction',
  standalone: true,
  imports: [TransactionComponent, CommonModule, NavbarAdminComponent, RouterModule],
  templateUrl: './list-transaction.component.html',
  styleUrl: './list-transaction.component.css'
})
export class ListTransactionComponent implements OnInit{

  destinatario: string = '';
  flag: boolean = false;
  transactions : Array<Transaction> = [];
  id ?: number;
  coming = false;
  pageSize = 4 ;
  currentPage = 1;

  private activatedRoute = inject(ActivatedRoute);
  // private userSessionService = inject(UserSessionService);
  private trasnsactionService = inject(TransactionService);

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        this.id = Number (params.get('id'));
            this.trasnsactionService.getTransactionsByAccountId(this.id).subscribe({
              next: (transactions) =>{
                this.transactions = transactions;
              }
            })
          },
          error: (e: Error) =>{
            console.log(e.message);
          }
        })
    }


  toggleFlag(): void {
    this.flag = !this.flag;
  }

  onCancel(): void {
    this.flag = false;
  }

  isIncoming(sourceId: number): boolean {
    if(sourceId === this.id){
      this.coming = false;
      return false
    }
    this.coming = true;
    return true;
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
}
