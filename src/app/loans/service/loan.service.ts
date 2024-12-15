import { Loan } from '../interface/loan';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LoanService {

  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService

  private baseUrl = 'http://localhost:3000/loans';

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  createLoan(loan: Loan): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.post<boolean>(`${this.baseUrl}`, loan, { headers });
  }

  getLoans(): Observable<Loan[]> {
    const headers = this.getHeaders();
    return this.http.get<Loan[]>(`${this.baseUrl}`, { headers });
  }

  getLoanById(id: number): Observable<Loan> {
    const headers = this.getHeaders();
    return this.http.get<Loan>(`${this.baseUrl}/${id}`, { headers });
  }

  getLoanByAccountId(id: number): Observable<Loan[]> {
    const headers = this.getHeaders();
    return this.http.get<Loan[]>(`${this.baseUrl}/account/${id}`, { headers });
  }

  updatePaid(id: number, amount: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.patch<boolean>(`${this.baseUrl}/update-paid/${id}`, { amount }, { headers });
  }
}
