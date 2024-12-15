import { Message } from '../interface/thread';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/message';
  private userSessionService = inject(UserSessionService); // Inyectamos el UserSessionService


  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getMessages(threadId: number): Observable<Message[]> {
    const headers = this.getHeaders();
    return this.http.get<Message[]>(`${this.baseUrl}/${threadId}`, { headers });
  }

  postMessage(threadId: number, senderType: string, message: string): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.post<boolean>(`${this.baseUrl}/${threadId}`, { senderType, message }, { headers });
  }
}
