import { inject, Injectable } from '@angular/core';
import { FixedTerm } from '../interface/fixed-term';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FixedTermService {
  private baseUrl = 'http://localhost:3000/fixedterms/';
  private http = inject(HttpClient)


  getFixedTerms(): Observable<FixedTerm[]> {
    return this.http.get<FixedTerm[]>(`${this.baseUrl}`);
  }

  getFixedTerm(id: number): Observable<FixedTerm> {
    return this.http.get<FixedTerm>(`${this.baseUrl}/${id}`);
  }

  createFixedTerm(fixedTerm: FixedTerm ): Observable<FixedTerm> {
    return this.http.post<FixedTerm>(this.baseUrl, fixedTerm);
  }


}
