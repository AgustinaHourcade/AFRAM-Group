import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Thread } from '../interface/thread';

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  constructor() { }

  private baseUrl = 'http://localhost:3000/support';
  private http = inject(HttpClient)

  getThreadByUserId(user_id : Number) : Observable<Thread[]>{
    return this.http.get<Thread[]>(`${this.baseUrl}/user/${user_id}`);
  }


  getAllThreads() : Observable<Thread[]>{
    return this.http.get<Thread[]>(`${this.baseUrl}`);
  }

  createThread(userId : number, subject : string): Observable<number>{
    return this.http.post<number>(`${this.baseUrl}/create`, {userId, subject});
  }

  updateStatus(threadId:number, newStatus:string) : Observable<boolean>{
    return this.http.put<boolean>(`${this.baseUrl}/status/${threadId}`, {newStatus});
  }

}
