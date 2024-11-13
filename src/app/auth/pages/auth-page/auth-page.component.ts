import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SignupComponent } from '../../components/signup/signup.component';
import { LoginComponent } from '../../components/login/login.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, SignupComponent, LoginComponent],
  templateUrl: './auth-page.component.html',
  styleUrl: './auth-page.component.css'
})
export class AuthPageComponent {
  isLoginActive = true;

  toggleForm(formType: string) {
    this.isLoginActive = (formType === 'login');
  }
}
