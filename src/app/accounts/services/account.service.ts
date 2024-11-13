import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { Account } from '../interface/account.interface';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  http = inject(HttpClient);

  private baseUrl = 'http://localhost:3000/accounts';


  getAccountsByIdentifier(id: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/dni-or-id/${id}`);
  }
  
  getAccountByAlias(alias: string | null | undefined): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/alias/${alias}`);
  }

  getAccountByCbu(cbu: string | null | undefined): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/cbu/${cbu}`);
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${id}`);
  }

  modifyAlias(id: number, newAlias: string): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/alias/${id}`, { alias: newAlias });
  }

  createAccount(account : {
    cbu: string,
    alias: string,
    account_type: string,
    user_id: number,
    overdraft_limit: number
  }): Observable<number>{
    return this.http.post<number>(`${this.baseUrl}`, account)
  }

  updateBalance(amount: number, id: number): Observable<boolean>{
    return this.http.put<boolean>(`${this.baseUrl}/${id}/balance`, {amount})
  }
  
}
