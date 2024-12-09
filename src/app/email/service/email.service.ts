import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSessionService } from '@auth/services/user-session.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:3000/email';
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  sendTransferEmail(to: string, amount: number, sourceUserId: number, destinationUserId: number) {
    const headers = this.getHeaders();
    return this.http.post(`${this.baseUrl}/send-transfer`, 
      { to, amount, sourceUserId, destinationUserId },
      { headers }
    );
  }

  sendRecoverEmail(email: string): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.post<boolean>(`${this.baseUrl}/send-recover`, { email }, { headers });
  }
}
