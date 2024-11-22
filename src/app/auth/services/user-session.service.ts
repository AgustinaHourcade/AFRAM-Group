import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {

  private readonly USER_ID_KEY = 'userId';
  estoyLogeado: boolean = false;
  private inactivityTimeout: any;
  private readonly INACTIVITY_LIMIT = 600000; // un minuto de inactividad
  route = inject(Router);

  constructor() {
    this.initializeInactivityListener();
  }

  setUserId(id: number): void {
    sessionStorage.setItem(this.USER_ID_KEY, id.toString());
    this.resetInactivityTimer();
  }

  getUserId(): number {
    const storedValue = sessionStorage.getItem(this.USER_ID_KEY);
    return storedValue ? Number(storedValue) : -1;
  }

  clearUserId(): void {
    sessionStorage.removeItem(this.USER_ID_KEY);
  }

  getLogIn() {
    return this.estoyLogeado;
  }

  logIn() {
    this.estoyLogeado = true;
    this.resetInactivityTimer();
  }

  logOut() {
    this.estoyLogeado = false;
    this.clearUserId();
    this.clearInactivityTimer();
  }

  private initializeInactivityListener(): void {
    const activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) =>
      window.addEventListener(event, () => this.resetInactivityTimer())
    );
  }

  private resetInactivityTimer(): void {
    this.clearInactivityTimer();
    if (this.estoyLogeado) {
      this.inactivityTimeout = setTimeout(() => {
        this.logOut();
        localStorage.clear();
        this.handleSessionExpiration();
      }, this.INACTIVITY_LIMIT);
    }
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }


  private handleSessionExpiration(): void {
    Swal.fire({
      title: "Sesión expirada por inactividad",
      confirmButtonColor: '#00b4d8',
      confirmButtonText: 'Aceptar',
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    });
    this.route.navigate(['/auth']);
  }
}
