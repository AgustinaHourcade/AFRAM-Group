import { Account } from '../interface/account.interface';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  // Dependency injections
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService); 

  private baseUrl = 'http://localhost:3000/accounts';

  // Utility method to generate HTTP headers with Authorization and User-Id
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  // Fetches a list of accounts based on a given identifier (e.g., DNI or ID)
  getAccountsByIdentifier(id: number): Observable<Account[]> {
    const headers = this.getHeaders();
    return this.http.get<Account[]>(`${this.baseUrl}/dni-or-id/${id}`, { headers });
  }

  // Fetches account ID by its alias
  getAccountByAlias(alias: string | null | undefined): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${this.baseUrl}/alias/${alias}`, { headers });
  }

  // Fetches account ID by its CBU (unique account number)
  getAccountByCbu(cbu: string | null | undefined): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${this.baseUrl}/cbu/${cbu}`, { headers });
  }

  // Fetches a single account based on its ID
  getAccountById(id: number): Observable<Account> {
    const headers = this.getHeaders();
    return this.http.get<Account>(`${this.baseUrl}/${id}`, { headers });
  }

  // Modifies the alias of a given account
  modifyAlias(id: number, newAlias: string): Observable<string> {
    const headers = this.getHeaders();
    return this.http.put<string>(`${this.baseUrl}/alias/${id}`, { alias: newAlias }, { headers });
  }

  // Deactivates an account based on its ID
  deactivateAccount(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.put<boolean>(`${this.baseUrl}/deactivate`, { accountId: id }, { headers });
  }

  // Creates a new account and returns the account ID
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

  // Updates the balance of an account based on the provided amount and account ID
  updateBalance(amount: number, id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.put<boolean>(`${this.baseUrl}/${id}/balance`, { amount }, { headers });
  }
}
