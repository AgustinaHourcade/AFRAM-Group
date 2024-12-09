import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSessionService } from '@auth/services/user-session.service';
import { Notification } from '../interface/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService

  private baseUrl = 'http://localhost:3000/notification';

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getNotificationsById(id: number): Observable<Notification[]> {
    const headers = this.getHeaders();
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${id}`, { headers });
  }

  postNotification(notification: Notification): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(`${this.baseUrl}`, notification, { headers });
  }

  markAsRead(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.patch<boolean>(`${this.baseUrl}/read/`, { id }, { headers });
  }

  markAllAsRead(user_id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.patch<boolean>(`${this.baseUrl}/read-all/`, { user_id }, { headers });
  }

  markSelectedAsRead(notificationIds: number[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.patch(`${this.baseUrl}/read-selected`, { ids: notificationIds }, { headers });
  }

  deleteNotification(id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`, { headers });
  }

  deleteAllNotifications(user_id: number): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.delete<boolean>(`${this.baseUrl}/user/${user_id}`, { headers });
  }
}
