import { Observable } from 'rxjs';
import { InterestRates } from '../interface/interest-rates.interface';
import { inject, Injectable } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InterestRatesService {

  private http = inject(HttpClient);
  private urlBase = 'http://localhost:3000/interestrates';
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

  getLastRate(): Observable<InterestRates> {
    const headers = this.getHeaders();
    return this.http.get<InterestRates>(`${this.urlBase}/latest`, { headers });
  }

  getRateById(id: number): Observable<InterestRates> {
    const headers = this.getHeaders();
    return this.http.get<InterestRates>(`${this.urlBase}/id/${id}`, { headers });
  }

  getRates(): Observable<InterestRates[]> {
    const headers = this.getHeaders();
    return this.http.get<InterestRates[]>(`${this.urlBase}`, { headers });
  }

  postRates(loan_interest_rate: number, fixed_term_interest_rate: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.post<boolean>(`${this.urlBase}`, { loan_interest_rate, fixed_term_interest_rate }, { headers });
  }
}
