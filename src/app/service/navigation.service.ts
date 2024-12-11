import { Injectable } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private previousUrl: string | null = null;
  private currentUrl: string | null = null;

  // Observable para obtener la URL previa
  private previousUrlSubject = new BehaviorSubject<string | null>(null);
  public previousUrl$ = this.previousUrlSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Cuando la navegación finaliza, actualizamos las URLs
        this.previousUrl = this.currentUrl;
        this.currentUrl = event.urlAfterRedirects;

        // Actualizamos el valor del observable
        this.previousUrlSubject.next(this.previousUrl);
      }
    });
  }

  // Obtener la URL anterior
  getPreviousUrl(): string {
    return this.previousUrl || '/'; // Si no existe, redirige al home
  }
}
