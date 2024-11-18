import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import bcrypt from 'bcryptjs';
import { EmailService } from '../../../email/service/email.service';
import Swal from 'sweetalert2';
import { HomeComponent } from "../../../pages/home/home.component";
import { NavbarHomeComponent } from "../../../shared/navbar-home/navbar-home.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarHomeComponent],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css'
})
export class RecoverPasswordComponent {

private fb = inject(FormBuilder);
private userService = inject(UserService);
private emailService = inject(EmailService);
private route = inject(Router);

formulario =  this.fb.nonNullable.group(
  {
    email: ['',[Validators.required, Validators.email]]
  }
)

  sendEmail(){
    const email = this.formulario.get('email')?.value;
   
    this.userService.getIdByEmail(email as string).subscribe({
        next: (id) =>{
          this.emailService.sendRecoverEmail(email as string).subscribe({
            next: (flag) =>{
                Swal.fire({
                  title: 'Le hemos enviado un mail con los pasos a seguir para cambiar su contraseña',
                  icon: 'success',
                });
                this.route.navigate(['/new-password']);
            },
            error: (e : Error) =>{
              console.log(e.message);
            }
          })
          

        },
        error: (e: Error) =>{
          Swal.fire({
            title: 'El email no coincide con ningun usuario!',
            icon: 'error',
          });
          console.log(e.message);
        }
    })

  }

}
