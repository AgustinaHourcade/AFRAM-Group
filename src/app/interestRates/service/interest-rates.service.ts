import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InterestRates } from '../interface/interest-rates.interface';

@Injectable({
  providedIn: 'root'
})
export class InterestRatesService {

  constructor() { }

  private http = inject(HttpClient);
  private urlBase = 'http://localhost:3000/interestrates';

  getLastRate(): Observable<InterestRates>{
    return this.http.get<InterestRates>(`${this.urlBase}/latest`);
  }

  getRateById(id: number): Observable<InterestRates>{
    return this.http.get<InterestRates>(`${this.urlBase}/id/${id}`);
  }

  getRates():Observable<InterestRates[]>{
    return this.http.get<InterestRates[]>(`${this.urlBase}`);
  }

  postRates(loan_interest_rate : number, fixed_term_interest_rate: number): Observable<boolean>{
    return this.http.post<boolean>(`${this.urlBase}`,{loan_interest_rate, fixed_term_interest_rate });
  }
}
