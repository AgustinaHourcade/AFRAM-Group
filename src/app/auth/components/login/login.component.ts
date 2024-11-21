import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../users/services/user.service';
import { UserSessionService } from '../../services/user-session.service';
import { User } from '../../../users/interface/user.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  showPassword = false;
  id: number = 0;

  togglePasswordVisibility(input: HTMLInputElement) {
    input.type = this.showPassword ? 'password' : 'text';
    this.showPassword = !this.showPassword;
  }

  fb = inject(FormBuilder);
  userService = inject(UserService);
  router = inject(Router);
  userSessionService = inject(UserSessionService);
  user?: User;

  formulario = this.fb.nonNullable.group({
    name_user: ['', [Validators.required, Validators.minLength(3)]],
    hashed_password: ['', [Validators.required, Validators.minLength(6)]],
    dni: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(8)]],
  });

  admitUser() {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) return;

    this.user = this.formulario.getRawValue() as User;

    this.admitirCliente(this.user);
  }

  errorMessage = '';

  admitirCliente(user: User | undefined) {
    const data = {
      username: user?.name_user as string,
      password: user?.hashed_password as string,
      dni: user?.dni as string,
    };
    this.userService.verifyUser(data).subscribe({
      next: (id) => {
        this.id = id as number;
        this.userSessionService.setUserId(Number(id));
        this.userSessionService.logIn();
        this.router.navigate(['/main']);
      },
      error: (error: Error) => {
        console.error('Error al verificar usuario:', error);
        this.errorMessage =
          'Usuario, DNI o contraseña incorrecta. Por favor, intenta de nuevo.';
      },
    });
  }
}
