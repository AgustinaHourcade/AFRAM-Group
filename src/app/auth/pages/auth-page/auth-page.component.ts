import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '@auth/components/login/login.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { SignupComponent } from '@auth/components/signup/signup.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, SignupComponent, LoginComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  //  ! LISTO
  private userSessionService = inject(UserSessionService);
  
  isLoginActive = true;

  // Función para alternar entre los formularios de inicio de sesión y registro
  toggleForm(formType: string) {
    this.isLoginActive = (formType === 'login');
  }

  ngOnInit(){
    this.userSessionService.clearUserId();
  }

  // COPIADO DEL REPOSITORIO
  // const container = document.getElementById('container');
  // const registerBtn = document.getElementById('register');
  // const loginBtn = document.getElementById('login');

  // registerBtn.addEventListener('click', () => {
  //   container.classList.add("active");
  // });

  // loginBtn.addEventListener('click', () => {
  //     container.classList.remove("active");
  // });
}
