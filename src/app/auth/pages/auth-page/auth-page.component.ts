import { CommonModule } from '@angular/common';
import { LoginComponent } from '@auth/components/login/login.component';
import { SignupComponent } from '@auth/components/signup/signup.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, SignupComponent, LoginComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent implements OnInit {
  private userSessionService = inject(UserSessionService);

  isLoginActive: boolean  = true;

  ngOnInit(){
    this.userSessionService.clearUserId();
  }

  // Feature to toggle between login and registration forms
  toggleForm(formType: string) {
    this.isLoginActive = (formType === 'login');
  }
}
