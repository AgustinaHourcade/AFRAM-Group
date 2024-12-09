import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSessionService } from '@auth/services/user-session.service';
import { Thread } from '../interface/thread';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService

  private baseUrl = 'http://localhost:3000/support';

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getThreadsByUserId(userId: number): Observable<Thread[]> {
    const headers = this.getHeaders();
    return this.http.get<Thread[]>(`${this.baseUrl}/user/${userId}`, { headers });
  }

  getThreadById(id: number): Observable<Thread> {
    const headers = this.getHeaders();
    return this.http.get<Thread>(`${this.baseUrl}/${id}`, { headers });
  }

  getAllThreads(): Observable<Thread[]> {
    const headers = this.getHeaders();
    return this.http.get<Thread[]>(`${this.baseUrl}`, { headers });
  }

  createThread(userId: number, subject: string): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(`${this.baseUrl}/create`, { userId, subject }, { headers });
  }

  updateStatus(threadId: number, newStatus: string): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.patch<boolean>(`${this.baseUrl}/status/${threadId}`, { newStatus }, { headers });
  }

  deleteThread(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`, { headers });
  }

  deleteAllThreads(userId: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.delete<boolean>(`${this.baseUrl}/user/${userId}`, { headers });
  }
}
