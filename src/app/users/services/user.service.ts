import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interface/user.interface';
import { UserSessionService } from '@auth/services/user-session.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private userSessionService = inject(UserSessionService);

  // URL base para todas las operaciones relacionadas con usuarios.
  private baseUrl = 'http://localhost:3000/users';

  // Obtiene todos los usuarios registrados en el sistema.
  getUsers(): Observable<User[]> {
    const token = this.userSessionService.getToken();
    const id = this.userSessionService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
      'user-id': `${id}` // Incluye el ID del usuario en los headers
    });

    return this.http.get<User[]>(`${this.baseUrl}/`, { headers });
  }

  // Obtiene el ID de un usuario basado en su DNI.
  getIdByDni(dni: string | undefined): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/id/${dni}`);
  }

  // Recupera la información completa de un usuario por su ID.
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  // Registra un nuevo usuario en el sistema.
  postUser(usuario: User): Observable<{ id: number, token: string }> {
    return this.http.post<{ id: number, token: string }>(`${this.baseUrl}/register`, usuario);
  }

  // Registra un nuevo usuario con información completa adicional.
  postCompleteUser(usuario: User): Observable<number> {
    const token = this.userSessionService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
    });

    return this.http.post<number>(`${this.baseUrl}/register-complete`, usuario, { headers });
  }

  // Actualiza información de un usuario basado en su ID.
  updateUser(datos: { phone: number, email: string }, id: number): Observable<User> {
    const token = this.userSessionService.getToken();
    const idUsuario = this.userSessionService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
      'user-id': `${idUsuario}` // Incluye el ID del usuario en los headers
    });

    return this.http.put<User>(`${this.baseUrl}/update/${id}`, datos, { headers });
  }

  // Verifica las credenciales de un usuario (nombre de usuario, DNI y contraseña).
  verifyUser(user: { username: string; dni: string; password: string }): Observable<{ id: number, token: string }> {
    return this.http.post<{ id: number, token: string }>(`${this.baseUrl}/verify`, user);
  }

  // Cambia la contraseña de un usuario, requiriendo su contraseña actual.
  changePassword(id: number, datos: { currentPassword: string | undefined, newPassword: string | undefined }): Observable<boolean> {
    const token = this.userSessionService.getToken();
    const idUsuario = this.userSessionService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
      'user-id': `${idUsuario}` // Incluye el ID del usuario en los headers
    });

    return this.http.put<boolean>(`${this.baseUrl}/change-password/${id}`, datos, { headers });
  }

  // Obtiene el ID de un usuario a partir de su email.
  getIdByEmail(email: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/email/${email}`);
  }

  // Cambia la contraseña de un usuario directamente mediante su ID.
  changePasswordById(newPassword: string, id: number): Observable<boolean> {
    return this.http.put<boolean>(`${this.baseUrl}/change-password-by-id/${id}`, { newPassword });
  }

  // Obtiene el ID de un usuario mediante un token de restablecimiento de contraseña.
  getUserIdByToken(token: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/reset-token/${token}`);
  }

  // Cambia el estado de actividad de un usuario (activo/inactivo).
  changeStatus(id: number, isActive: string): Observable<boolean> {
    const token = this.userSessionService.getToken();
    const idUsuario = this.userSessionService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
      'user-id': `${idUsuario}` // Incluye el ID del usuario en los headers
    });

    return this.http.post<boolean>(`${this.baseUrl}/toggle-user-status/${id}`, { isActive }, { headers });
  }

  // Cambia el rol del administrador (por ejemplo, usuario normal a administrador).
  changeAdminStatus(id: number, userType: string): Observable<boolean> {
    const token = this.userSessionService.getToken();
    const idUsuario = this.userSessionService.getUserId();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Incluye el token en los headers
      'user-id': `${idUsuario}` // Incluye el ID del usuario en los headers
    });

    return this.http.post<boolean>(`${this.baseUrl}/toggle-admin-status/${id}`, { userType }, { headers });
  }

  // Cambia el estado de un usuario (bloqueado si o no, para cuando realiza más de 3 intentos de login fallidos).
  blockUser(dni: string): Observable<boolean> {
    return this.http.patch<boolean>(`${this.baseUrl}/block`, { dni });
  }

  // Cambia el estado de un usuario (bloqueado si o no, para cuando realiza más de 3 intentos de login fallidos).
  unblockUser(dni: string): Observable<boolean> {
    return this.http.patch<boolean>(`${this.baseUrl}/unblock`, { dni });
  }
}
