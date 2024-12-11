import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Account } from '../interface/account.interface';
import { UserSessionService } from '@auth/services/user-session.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService
  private baseUrl = 'http://localhost:3000/accounts';

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getAccountsByIdentifier(id: number): Observable<Account[]> {
    const headers = this.getHeaders();
    return this.http.get<Account[]>(`${this.baseUrl}/dni-or-id/${id}`, { headers });
  }

  getAccountByAlias(alias: string | null | undefined): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${this.baseUrl}/alias/${alias}`, { headers });
  }

  getAccountByCbu(cbu: string | null | undefined): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${this.baseUrl}/cbu/${cbu}`, { headers });
  }

  getAccountById(id: number): Observable<Account> {
    const headers = this.getHeaders();
    return this.http.get<Account>(`${this.baseUrl}/${id}`, { headers });
  }

  modifyAlias(id: number, newAlias: string): Observable<string> {
    const headers = this.getHeaders();
    return this.http.put<string>(`${this.baseUrl}/alias/${id}`, { alias: newAlias }, { headers });
  }

  deactivateAccount(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.put<boolean>(`${this.baseUrl}/deactivate`, { accountId: id }, { headers });
  }

  createAccount(account: {
    cbu: string;
    alias: string;
    account_type: string;
    user_id: number;
    overdraft_limit: number;
    currency: string;
  }): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}`, account);
  }

  updateBalance(amount: number, id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.put<boolean>(`${this.baseUrl}/${id}/balance`, { amount }, { headers });
  }
}
