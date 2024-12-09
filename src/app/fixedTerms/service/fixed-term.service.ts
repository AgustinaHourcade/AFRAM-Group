import { inject, Injectable } from '@angular/core';
import { FixedTerm } from '../interface/fixed-term';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserSessionService } from '@auth/services/user-session.service';

@Injectable({
  providedIn: 'root'
})
export class FixedTermService {
  private baseUrl = 'http://localhost:3000/fixedterms';
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getFixedTerms(): Observable<FixedTerm[]> {
    const headers = this.getHeaders();
    return this.http.get<FixedTerm[]>(`${this.baseUrl}`, { headers });
  }

  getFixedTerm(id: number): Observable<FixedTerm> {
    const headers = this.getHeaders();
    return this.http.get<FixedTerm>(`${this.baseUrl}/${id}`, { headers });
  }

  createFixedTerm(fixedTerm: FixedTerm): Observable<FixedTerm> {
    const headers = this.getHeaders();
    return this.http.post<FixedTerm>(this.baseUrl, fixedTerm, { headers });
  }

  getFixedTermsByAccountId(id: number): Observable<FixedTerm[]> {
    const headers = this.getHeaders();
    return this.http.get<FixedTerm[]>(`${this.baseUrl}/account/${id}`, { headers });
  }

  setPayFixedTerms(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.patch<boolean>(`${this.baseUrl}/is-paid`, { id }, { headers });
  }
}
