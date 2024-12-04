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

  showPassword = false;
  id: number = 0;
  user?: User;
  errorMessage = '';
  accounts!: Array<Account>;
  intentos: number = 0;

  togglePasswordVisibility(input: HTMLInputElement) {
    input.type = this.showPassword ? 'password' : 'text';
    this.showPassword = !this.showPassword;
  }

  formulario = this.fb.nonNullable.group({
    name_user: ['', [Validators.required, Validators.minLength(3)]],
    hashed_password: ['', [Validators.required, Validators.minLength(6)]],
    dni: ['', [Validators.required, Validators.min(999999)]]
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

    if(this.intentos<3 && user?.is_blocked === 'no'){
      this.userService.verifyUser(data).subscribe({
        next: (id) => {
          this.id = id as number;
          this.userSessionService.setUserId(Number(id));
          
          this.userService.getUser(Number(id)).subscribe({
            next: (user) => {
              if(user.is_blocked === 'yes' ){
                Swal.fire({
                  title: 'Su cuenta esta bloqueada',
                  text: 'Ha excedido el límite de intentos de inicio de sesion. Verifique el email asociado a su cuenta para restablecer la contraseña',
                  icon: 'error',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#00b4d8'
                })
                return;
              }
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
          this.intentos += 1;
          console.error('Error al verificar usuario:', error);
          this.errorMessage =
          'Usuario, DNI o contraseña incorrecta. Por favor, intenta de nuevo.';
        },
      });
    }else{
      Swal.fire({
        title: 'Intentos de inicio de sesión superados',
        text: 'Ha excedido el límite de intentos. Le enviamos un email a su cuenta con los pasos a seguir para restablecer la contraseña.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonColor: '#00b4d8'
      }).then((result) => {
        if (result.isConfirmed) {
          this.userService.blockUser(data.dni).subscribe({
            next: (flag) => {
              console.log("Cuenta bloqueada con exito.");
            },
            error: (e:Error) => {
              Swal.fire({
                title: 'Para recuperar su cuenta dirijase a olvide mi contraseña ',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#00b4d8'
              })
            }
          })
        } 
      })
    }
  }
}
