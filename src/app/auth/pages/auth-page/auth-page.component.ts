import { CommonModule } from '@angular/common';
import { LoginComponent } from '@auth/components/login/login.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { Component, inject } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';

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

  // Feature to toggle between login and registration forms
  toggleForm(formType: string) {
    this.isLoginActive = (formType === 'login');
  }

  ngOnInit(){
    this.userSessionService.clearUserId();
  }

}
