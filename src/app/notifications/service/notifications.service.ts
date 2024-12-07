import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Notification } from '../interface/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private http = inject(HttpClient)
  private baseUrl = 'http://localhost:3000/notification';

  getNotificationsById(id: number) : Observable<Notification[]>{
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${id}`);
  }

  postNotification(notification: Notification) : Observable<number>{
    return this.http.post<number>(`${this.baseUrl}`,notification)
  }

  markAsRead(id : number) : Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}/read/`,{id})
  }

  markAllAsRead(user_id : number) : Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}/read-all/`,{user_id})
  }

  markSelectedAsRead(notificationIds: number[]): Observable<any> {
    return this.http.patch(`${this.baseUrl}/read-selected`, { ids: notificationIds });
  }

  deleteNotification(id : number) : Observable<boolean>{
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`)
  }

  deleteAllNotifications(user_id : number) : Observable<boolean>{
    return this.http.delete<boolean>(`${this.baseUrl}/user/${user_id}`)
  }
}
