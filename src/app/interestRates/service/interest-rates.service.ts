import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSessionService } from '@auth/services/user-session.service';
import { InterestRates } from '../interface/interest-rates.interface';

@Injectable({
  providedIn: 'root'
})
export class InterestRatesService {

  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService
  private urlBase = 'http://localhost:3000/interestrates';

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
