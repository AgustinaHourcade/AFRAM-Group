import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Card } from '../interface/card';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor() { }

  private http = inject(HttpClient);
  private urlBase = 'http://localhost:3000/cards/';

  getCards(): Observable<Card[]>{
    return this.http.get<Card[]>(this.urlBase);
  }

  getCardsById(user_id: number): Observable<Card[]>{
    return this.http.get<Card[]>(`${this.urlBase}user/${user_id}`);
  }

  createCard(card : Card): Observable<Card>{
    return this.http.post<Card>(this.urlBase, card);
  }

  disableCard(card_id: number): Observable<boolean>{
    return this.http.put<boolean>(`${this.urlBase}deactivate`, {card_id});
  }

  
}
