import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { EmailService } from '../../../email/service/email.service';
import Swal from 'sweetalert2';
import { HomeComponent } from '../../../pages/home/home.component';
import { NavbarHomeComponent } from '../../../shared/navbar-home/navbar-home.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarHomeComponent],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css',
})
export class RecoverPasswordComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private emailService = inject(EmailService);
  private route = inject(Router);

  formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  sendEmail() {
    const email = this.formulario.get('email')?.value;

    const startTime = Date.now();

    let timerInterval: number; 

    Swal.fire({
      title: "Enviando email!",
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup()?.querySelector("b");

        if (timer) {
          timerInterval = window.setInterval(() => { 
            timer.textContent = `${Swal.getTimerLeft()}`;
          }, 100);
        }
      },
      willClose: () => {
        window.clearInterval(timerInterval); 
      }
    });

    this.userService.getIdByEmail(email as string).subscribe({
      next: (id) => {
        this.emailService.sendRecoverEmail(email as string).subscribe({
          next: (flag) => {
            // const responseTime = Date.now() - startTime;

            // const adjustedTime = Math.max(2000, responseTime); 

            Swal.fire({
              title: 'Hemos enviado un mail con los pasos a seguir para cambiar su contraseña',
              icon: 'success',
              confirmButtonText: "Ok"
              // timer: adjustedTime, 
              // timerProgressBar: true
            });
            this.route.navigate(['/new-password']);
          },
          error: (e: Error) => {
            console.log(e.message);
            // const responseTime = Date.now() - startTime;
            // const adjustedTime = Math.max(2000, responseTime); 

            Swal.fire({
              title: 'Lo sentimos. Hubo un error al enviar el correo',
              icon: 'error',
              // timer: adjustedTime, 
              // timerProgressBar: true
            });
          },
        });
      },
      error: (e: Error) => {
        console.log(e.message);
        const responseTime = Date.now() - startTime;
        const adjustedTime = Math.max(2000, responseTime); 

        Swal.fire({
          title: 'El email no coincide con ningun usuario',
          icon: 'error',
          timer: adjustedTime, 
          timerProgressBar: true
        });
      },
    });
  }
}
