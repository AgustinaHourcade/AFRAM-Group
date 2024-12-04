import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  // URL base para todas las operaciones relacionadas con usuarios.
  private baseUrl = 'http://localhost:3000/users/';

  // Obtiene todos los usuarios registrados en el sistema.
  getUsers():Observable<User[]>{
    return this.http.get<User[]>(this.baseUrl);
  }

  // Obtiene el ID de un usuario basado en su DNI.
  getIdByDni(dni: string | undefined): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}id/${dni}`);
  }

  // Recupera la información completa de un usuario por su ID.
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}${id}`);
  }

  // Registra un nuevo usuario en el sistema.
  postUser(usuario: User): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}register`, usuario);
  }

  // Registra un nuevo usuario con información completa adicional.
  postCompleteUser(usuario: User): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}register-complete`, usuario);
  }

  // Actualiza información de un usuario basado en su ID.
  updateUser(datos: {phone: number, email: string}, id: number): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}update/${id}`, datos);
  }

  // Verifica las credenciales de un usuario (nombre de usuario, DNI y contraseña).
  verifyUser(user: { username: string; dni: string; password: string }): Observable<Number> {
    return this.http.post<Number>(`${this.baseUrl}verify`, user);
  }

  // Cambia la contraseña de un usuario, requiriendo su contraseña actual.
  changePassword(id: number,  datos: {currentPassword: string | undefined, newPassword: string | undefined}): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}change-password/${id}`, datos);
  }

  // Obtiene el ID de un usuario a partir de su email.
  getIdByEmail(email: string): Observable<number>{
    return this.http.get<number>(`${this.baseUrl}email/${email}`);
  }

  // Cambia la contraseña de un usuario directamente mediante su ID.
  changePasswordById(newPassword: string, id: number): Observable<boolean>{
    return this.http.put<boolean>(`${this.baseUrl}change-password-by-id/${id}`, {newPassword})
  }

  // Obtiene el ID de un usuario mediante un token de restablecimiento de contraseña.
  getUserIdByToken(token: number): Observable<number>{
      return this.http.get<number>(`${this.baseUrl}reset-token/${token}`)
  }

  // Cambia el estado de actividad de un usuario (activo/inactivo)
  changeStatus(id: number, isActive: string): Observable<boolean>{
    return this.http.post<boolean>(`${this.baseUrl}toggle-user-status/${id}`, {isActive});
  }

  // Cambia el rol del administrador (por ejemplo, usuario normal a administrador).
  changeAdminStatus(id: number, userType: string): Observable<boolean>{
    return this.http.post<boolean>(`${this.baseUrl}toggle-admin-status/${id}`, {userType});
  }

// Cambia el estado de un usuario (bloqueado si o no, para cuando realiza mas de 3 intentos de login fallidos).
  blockUser(dni: string): Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}block`, {dni});
  }

  // Cambia el estado de un usuario (bloqueado si o no, para cuando realiza mas de 3 intentos de login fallidos).
  unblockUser(dni: string): Observable<boolean>{
    return this.http.patch<boolean>(`${this.baseUrl}unblock`, {dni});
  }
}
