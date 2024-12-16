import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { UserService } from '@users/services/user.service';
import { EmailService } from '@email/service/email.service';
import { Component, inject } from '@angular/core';
import { NavbarHomeComponent } from '@shared/navbar-home/navbar-home.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarHomeComponent],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css',
})
export class RecoverPasswordComponent {
  private fb = inject(FormBuilder);
  private route = inject(Router);
  private userService = inject(UserService);
  private emailService = inject(EmailService);

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
      next: () => {
        this.emailService.sendRecoverEmail(email as string).subscribe({
          next: () => {
            Swal.fire({
              title: 'Hemos enviado un email con los pasos a seguir para cambiar su contraseña.',
              icon: 'success',
              confirmButtonText: "Ok",
              confirmButtonColor: '#00b4d8'
            });
            this.route.navigate(['/new-password']);
          },
          error: () => {
            Swal.fire({
              title: 'Lo sentimos. Hubo un error al enviar el correo, intente nuevamente.',
              icon: 'error',
            });
          },
        });
      },
      error: (e: Error) => {
        console.log(e.message);
        const responseTime = Date.now() - startTime;
        const adjustedTime = Math.max(2000, responseTime);

        Swal.fire({
          title: 'El email no coincide con ningun usuario.',
          icon: 'error',
          timer: adjustedTime,
          timerProgressBar: true
        });
      },
    });
  }
}
