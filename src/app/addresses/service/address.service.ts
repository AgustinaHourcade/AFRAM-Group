import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '@addresses/interface/address.interface';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);

  private urlBase = 'http://localhost:3000/addresses/';

  getAddressByUserId(user_id: number): Observable<Address> {
    return this.http.get<Address>(`${this.urlBase}user/${user_id}`);
  }

  updateAddress(address: Address, id: number): Observable<Address> {
    return this.http.patch<Address>(`${this.urlBase}user/${id}`, address);
  }

  postAddress(address: Address): Observable<number> {
    return this.http.post<number>(this.urlBase, address);
  }

  createAddress(user_id: number, address: Address): Observable<number> {
    return this.http.post<number>(`${this.urlBase}create/${user_id}`, address)
  }
}
