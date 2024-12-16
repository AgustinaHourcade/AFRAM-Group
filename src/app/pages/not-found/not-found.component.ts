import { UserSessionService } from '@auth/services/user-session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css'
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private userSessionService = inject(UserSessionService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  redirectUrl = '/';
  countdown = 5;  
  private countdownInterval: any;

  ngOnInit(): void {
    // Obtener el parámetro 'redirectUrl' desde la ruta actual
    this.redirectUrl = this.activatedRoute.snapshot.queryParamMap.get('redirectUrl') || '/';
    
    // Iniciar la cuenta regresiva
    this.countdownInterval = setInterval(() => {
      this.countdown--;  // Disminuir el contador
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);  // Detener la cuenta regresiva
        this.userSessionService.logOut();  // Cerrar sesión
        this.router.navigate([this.redirectUrl]);  // Redirigir al usuario
      }
    }, 1000);  // Ejecutar cada 1 segundo
  }

  ngOnDestroy(): void {
    // Limpiar el intervalo al destruir el componente
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}
  
  


