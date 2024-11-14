import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface/user.interface';
import { Address } from '../../addresses/interface/address.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);

  private baseUrl = 'http://localhost:3000/users/';

  getIdByDni(dni: string | undefined): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}id/${dni}`);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}${id}`);
  }

  postUser(usuario: User): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}register`, usuario);
  }

  updateUser(datos: {phone: string, email: string}, id: number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}update/${id}`, datos);
  }

  verifyUser(user: { username: string; dni: string; password: string }): Observable<Number> {
    return this.http.post<Number>(`${this.baseUrl}verify`, user); 
  }

  changePassword(id: number,  datos: {currentPassword: string, newPassword: string}): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}change-password/${id}`, datos);
  }

}