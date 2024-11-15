import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Loan } from '../interface/loan';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  constructor() { }

  private baseUrl = 'http://localhost:3000/loans';
  private http = inject(HttpClient)


  createLoan(loan: Loan): Observable<boolean>{
    return this.http.post<boolean>(`${this.baseUrl}`, loan);
  }

  getLoans() : Observable<Loan[]>{
    return this.http.get<Loan[]>(`${this.baseUrl}`);
  }

  getLoanById(id: number) : Observable<Loan>{
    return this.http.get<Loan>(`${this.baseUrl}/${id}`);
  }

  getLoanByAccountId(id: number) : Observable<Loan[]>{
    return this.http.get<Loan[]>(`${this.baseUrl}/account/${id}`);
  }

  updatePaid(id: number, amount :number) : Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}/update-paid/${id}`, {amount});
  }
}
