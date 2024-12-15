import { Card } from '../interface/card';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  constructor() {}

  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService
  private urlBase = 'http://localhost:3000/cards';

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getCards(): Observable<Card[]> {
    const headers = this.getHeaders();
    return this.http.get<Card[]>(this.urlBase, { headers });
  }

  getCardsById(user_id: number): Observable<Card[]> {
    const headers = this.getHeaders();
    return this.http.get<Card[]>(`${this.urlBase}/user/${user_id}`, { headers });
  }

  createCard(card: {
    card_number: string;
    expiration_date: string;
    cvv: number;
    card_type: string | undefined;
    user_id: number;
    account_id: number | undefined;
  }): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.post<boolean>(this.urlBase, card, { headers });
  }

  disableCard(card_id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.put<boolean>(`${this.urlBase}/deactivate`, { card_id }, { headers });
  }
}
