import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Message } from '../interface/thread';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor() { }

  private baseUrl = 'http://localhost:3000/message';
  private http = inject(HttpClient)

  getMessages(threadId: number) : Observable<Message[]>{
    return this.http.get<Message[]>(`${this.baseUrl}/${threadId}`);
  }

  postMessage(threadId: number, senderType : string, message: string) : Observable<boolean>{
    return this.http.post<boolean>(`${this.baseUrl}/${threadId}`, {senderType, message});
  }


}
