import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '@addresses/interface/address.interface';
import { UserSessionService } from '@auth/services/user-session.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  // Inyectamos el UserSessionService
  private urlBase = 'http://localhost:3000/addresses';

  // Función para obtener los headers con token y userId
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  getAddressByUserId(user_id: number): Observable<Address> {
    const headers = this.getHeaders();
    return this.http.get<Address>(`${this.urlBase}/user/${user_id}`, { headers });
  }

  updateAddress(address: Address, id: number): Observable<Address> {
    const headers = this.getHeaders();
    return this.http.patch<Address>(`${this.urlBase}/user/${id}`, address, { headers });
  }

  postAddress(address: Address): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(this.urlBase, address, { headers });
  }

  createAddress(user_id: number, address: Address): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(`${this.urlBase}/create/${user_id}`, address, { headers });
  }
}
