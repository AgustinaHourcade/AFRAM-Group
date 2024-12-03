import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { UserService } from '@users/services/user.service';
import { Account } from '@accounts/interface/account.interface';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private userSessionService = inject(UserSessionService);
  // private accountService = inject(AccountService);

  showPassword = false;
  id: number = 0;
  user?: User;
  errorMessage = '';
  accounts!: Array<Account>;

  togglePasswordVisibility(input: HTMLInputElement) {
    input.type = this.showPassword ? 'password' : 'text';
    this.showPassword = !this.showPassword;
  }

  formulario = this.fb.nonNullable.group({
    name_user: ['', [Validators.required, Validators.minLength(3)]],
    hashed_password: ['', [Validators.required, Validators.minLength(6)]],
    dni: ['', Validators.required],
  });

  admitUser() {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) return;

    this.user = this.formulario.getRawValue() as User;

    this.admitirCliente(this.user);
  }

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

        this.userService.getUser(Number(id)).subscribe({
          next: (user) => {
            this.userSessionService.logIn(Number(id), user.user_type as string, this.accounts);
            if (user.user_type === 'admin') {
              Swal.fire({
                title: `¿Como desea iniciar sesión?`,
                text: 'Puede ingresar como Administrator o como Cliente.',
                icon: 'question',
                showCancelButton: true,
                showDenyButton: true,
                confirmButtonColor: '#00b4d8',
                denyButtonColor: "#003559",
                cancelButtonColor: "#e63946",
                confirmButtonText: 'Cliente',
                cancelButtonText: 'Cancelar',
                denyButtonText: `Administrador`,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.userSessionService.setUserType('user');
                  this.router.navigate(['/main']);
                } else if(result.isDenied) {
                  this.router.navigate(['/admin-main']);
                }
              });}
              else {
              this.router.navigate(['/main']);
            }
          },
          error: (e: Error) => {
            console.log(e.message);
          }
        })

      },
      error: (error: Error) => {
        console.error('Error al verificar usuario:', error);
        this.errorMessage =
          'Usuario, DNI o contraseña incorrecta. Por favor, intenta de nuevo.';
      },
    });
  }
}
