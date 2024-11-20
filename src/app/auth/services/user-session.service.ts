import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  private readonly USER_ID_KEY = 'userId';
  estoyLogeado: boolean = false;

  // Guarda el ID en sessionStorage
  setUserId(id: number): void {
    sessionStorage.setItem(this.USER_ID_KEY, id.toString());
  }

  // Obtiene el ID del usuario como número
  getUserId(): number {
    const storedValue = sessionStorage.getItem(this.USER_ID_KEY);
    return storedValue ? Number(storedValue) : -1;
  }

  // Limpia el ID del usuario
  clearUserId(): void {
    sessionStorage.removeItem(this.USER_ID_KEY);
  }
  
  getLogIn(){
    return this.estoyLogeado
  }  

  logIn(){
    this.estoyLogeado = false;
  }

  logOut(){
    this.estoyLogeado = true;
  }
}
