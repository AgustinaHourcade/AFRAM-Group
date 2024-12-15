import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Address } from '@addresses/interface/address.interface';
import { UserSessionService } from '@auth/services/user-session.service';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  // Dependency Injection
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);  

  private urlBase = 'http://localhost:3000/addresses';

  // Utility method to generate HTTP headers with Authorization and User-Id
  private getHeaders(): HttpHeaders {
    const token = this.userSessionService.getToken();
    const userId = this.userSessionService.getUserId();

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'User-Id': userId,
    });
  }

  /**
   * Fetches the address of a specific user by their ID.
   * @param user_id - The ID of the user whose address is being requested.
   * @returns Observable<Address> - Observable containing the address data.
   */
  getAddressByUserId(user_id: number): Observable<Address> {
    const headers = this.getHeaders();
    return this.http.get<Address>(`${this.urlBase}/user/${user_id}`, { headers });
  }

  /**
   * Updates an existing address by its ID.
   * @param address - The updated address object.
   * @param id - The ID of the address to update.
   * @returns Observable<Address> - Observable containing the updated address data.
   */
  updateAddress(address: Address, id: number): Observable<Address> {
    const headers = this.getHeaders();
    return this.http.patch<Address>(`${this.urlBase}/user/${id}`, address, { headers });
  }

  /**
   * Creates a new address entry in the database.
   * @param address - The address data to be created.
   * @returns Observable<number> - Observable containing the ID of the newly created address.
   */
  postAddress(address: Address): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(this.urlBase, address, { headers });
  }

  /**
   * Creates a new address for a specific user.
   * Useful when associating an address with a specific user during creation.
   * @param user_id - The ID of the user for whom the address is being created.
   * @param address - The address data to be created.
   * @returns Observable<number> - Observable containing the ID of the newly created address.
   */
  createAddress(user_id: number, address: Address): Observable<number> {
    const headers = this.getHeaders();
    return this.http.post<number>(`${this.urlBase}/create/${user_id}`, address, { headers });
  }
}
