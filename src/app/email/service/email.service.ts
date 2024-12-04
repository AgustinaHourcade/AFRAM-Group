import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:3000/email';
  private http = inject(HttpClient)

  sendTransferEmail(to: string, amount: number, sourceUserId: number, destinationUserId: number) {
    return this.http.post(`${this.baseUrl}/sendTransfer`, { to, amount, sourceUserId, destinationUserId });
  }

  sendRecoverEmail(email: string): Observable<boolean>{
    return this.http.post<boolean>(`${this.baseUrl}/send-recover`, {email});
  }

}
