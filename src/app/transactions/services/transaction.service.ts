import { Transaction } from './../interface/transaction.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSessionService } from '@auth/services/user-session.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService); // Inyectamos el UserSessionService

  private baseUrl = 'http://localhost:3000/transactions';

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getTransactionsByAccountId(id: number): Observable<Transaction[]> {
    const headers = this.getHeaders();
    return this.http.get<Transaction[]>(`${this.baseUrl}/account/${id}`, { headers });
  }

  postTransaction(transaction: Transaction): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(`${this.baseUrl}/`, transaction, { headers });
  }

  postFutureTransaction(transaction: Transaction): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(`${this.baseUrl}/future-transaction`, transaction, { headers });
  }

  setPayTransferProgramming(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.patch<boolean>(`${this.baseUrl}/is-paid`, { id }, { headers });
  }

  deleteTransaction(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`, { headers });
  }
}
