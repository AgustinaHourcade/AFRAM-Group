import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { LoginComponent } from '@auth/components/login/login.component';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, SignupComponent, LoginComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  isLoginActive = true;
  private userSessionService = inject(UserSessionService);

  toggleForm(formType: string) {
    this.isLoginActive = (formType === 'login');
  }

  ngOnInit(){
    this.userSessionService.clearUserId();
  }
}
