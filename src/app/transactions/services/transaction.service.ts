import { Transaction } from './../interface/transaction.interface';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:3000/transactions';

  getTransactionsByAccountId(id: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/account/${id}`);
  }

  postTransaction(transaction: Transaction): Observable<number> {
    return this.http.post<number>(this.baseUrl, transaction);
  }

  postFutureTransaction(transaction: Transaction): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/future-transaction`, transaction);
  }
  
  setPayTransferProgramming(id: number): Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}/is-paid`, {id})
  }

  deleteTransaction(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`)
  }
}
