import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Thread } from '../interface/thread';

@Injectable({
  providedIn: 'root'
})
export class SupportServiceService {
  
  constructor() { }

  private baseUrl = 'http://localhost:3000/support';
  private http = inject(HttpClient)

  getThreadByUserId(userId : Number) : Observable<Thread>{
    return this.http.get<Thread>(`${this.baseUrl}/${userId}`);
  }

}
