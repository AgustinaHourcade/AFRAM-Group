import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Notification } from '../interface/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {


  constructor() {}

  private baseUrl = 'http://localhost:3000/notification';
  private http = inject(HttpClient)

  getNotificationsById(id: number) : Observable<Notification[]>{
    return this.http.get<Notification[]>(`${this.baseUrl}/user/${id}`);
  }

  postNotification(notification: Notification) : Observable<number>{
    return this.http.post<number>(`${this.baseUrl}`,notification)
  }

  deleteNotification(id : number) : Observable<boolean>{
    return this.http.delete<boolean>(`${this.baseUrl}/${id}`)
  }

  markAsRead(id : number) : Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}/read/`,{id})
  }

  markAllAsRead(user_id : number) : Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}/read-all/`,{user_id})
  }


  deleteAllNotifications(user_id : number) : Observable<boolean>{
    return this.http.delete<boolean>(`${this.baseUrl}/user/${user_id}`)
  }

}
