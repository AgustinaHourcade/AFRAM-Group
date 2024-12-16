import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { Account } from '@accounts/interface/account.interface';
import { UserService } from '@users/services/user.service';
import { CommonModule } from '@angular/common';
import { EmailService } from '@email/service/email.service';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserSessionService } from '@auth/services/user-session.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private emailService = inject(EmailService);
  private userSessionService = inject(UserSessionService);

  id: number = 0;
  user?: User;
  token: string = '';
  intentos: number = 0;
  accounts!: Account[];
  userLogin?: User;
  showPassword: boolean = false;
  errorMessage: string = '';

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

    this.userLogin = this.formulario.getRawValue() as User;
    const dni = this.formulario.get('dni')?.value;
    this.userService.getIdByDni(dni).subscribe({
      next: (id) => {
        this.userService.getUser(id).subscribe({
          next: (user) => this.user = user,
          error: (e: Error) => console.log(e.message)
        })
      },
      error: (e: Error) => console.log(e.message)
    })

    this.admitirCliente();
  }

  admitirCliente() {
    const data = {
      username: this.userLogin?.name_user as string,
      password: this.userLogin?.hashed_password as string,
      dni: this.userLogin?.dni as string,
    };

    this.userService.getIdByDni(data.dni).subscribe({
      next: (id) => {
        this.userService.getUser(id).subscribe({
          next: (user) => {
            this.user = user;
            this.intentos = Number(user.login_attempts);
            if(this.intentos < 3){
              this.userService.verifyUser(data).subscribe({
                next: (response) => {
                  this.id = response.id; 
                  this.token = response.token; 

                  this.userSessionService.setUserId(this.id); // Guarda el ID en el servicio
                  this.userSessionService.setToken(this.token);

                  if(this.intentos > 0){
                    this.userService.unblockUser(user.dni).subscribe({
                      error: (e:Error) => console.log(e.message)
                    })
                  }
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
                      });
                      }
                      else {
                        this.router.navigate(['/main']);
                      }
                    },
                    error: (e: Error) => console.log(e.message)
                })
                },
                error: (error: Error) => {
                  this.userService.blockUser(data.dni).subscribe({
                    next: () => {
                      this.intentos += 1;
                      if(this.intentos == 3){
                        Swal.fire({
                          title: 'Intentos de inicio de sesión superados',
                          text: 'Ha excedido el límite de intentos. Le hemos enviado un email a su cuenta con los pasos a seguir para restablecer la contraseña.',
                          icon: 'error',
                          confirmButtonText: 'Aceptar',
                          allowOutsideClick: false,
                          allowEscapeKey: false,
                          confirmButtonColor: '#00b4d8'
                        })

                        this.emailService.sendRecoverEmail(this.user?.email as string).subscribe({
                          error: (e: Error) => console.log(e.message)
                        })
                        this.router.navigate(['/new-password']);
                      }
                    },
                    error: (e:Error) => console.log(e.message)
                  })
                  this.errorMessage = 'Usuario, DNI o contraseña incorrecta. Por favor, intenta de nuevo.';
                },
              });
            }else{
              Swal.fire({
                title: 'Su cuenta esta bloqueada',
                text: 'Ha excedido el límite de intentos. Revise su email y siga los pasos para restablecerla.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                allowOutsideClick: false,
                allowEscapeKey: false,
                confirmButtonColor: '#00b4d8'
              })
              this.router.navigate(['/new-password']);
            }
          },
          error: (e: Error) => console.log(e.message)
        })
      },
      error: (e: Error) => console.log(e.message)
    })
  }
}
