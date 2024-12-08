import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Account } from '@accounts/interface/account.interface';

@Injectable({
  providedIn: 'root',
})
export class UserSessionService {
  private readonly USER_ID_KEY = 'userId';
  private readonly USER_TYPE_KEY = 'userType';
  private readonly ACCOUNTS_KEY = 'accounts';
  private inactivityTimeout: any;
  private readonly INACTIVITY_LIMIT = 600000;
  private route = inject(Router);

  estoyLogeado: boolean = false;

  constructor() {
    this.initializeInactivityListener();
  }

  // User ID
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

  // User Type
  setUserType(userType: string): void {
    sessionStorage.setItem(this.USER_TYPE_KEY, userType);
  }

  getUserType(): string | null {
    return sessionStorage.getItem(this.USER_TYPE_KEY);
  }

  clearUserType(): void {
    sessionStorage.removeItem(this.USER_TYPE_KEY);
  }

  // Accounts
  setAccounts(accounts: any[]): void {
    sessionStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
  }

  getAccounts(): any[] | null {
    const storedAccounts = sessionStorage.getItem(this.ACCOUNTS_KEY);
    return storedAccounts ? JSON.parse(storedAccounts) : null;
  }

  clearAccounts(): void {
    sessionStorage.removeItem(this.ACCOUNTS_KEY);
  }

  // Log In/Out
  logIn(userId: number, userType: string, accounts: Account[]): void {
    this.estoyLogeado = true;
    this.setUserId(userId);
    this.setUserType(userType);
    this.setAccounts(accounts);
    this.resetInactivityTimer();
  }

  logOut(): void {
    this.estoyLogeado = false;
    this.clearUserId();
    this.clearUserType();
    this.clearAccounts();
    this.clearInactivityTimer();
  }

  getLogIn(): boolean {
    return this.estoyLogeado;
  }

  // Inactivity Management
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
