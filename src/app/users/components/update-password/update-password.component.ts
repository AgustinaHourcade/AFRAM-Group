import { Component, inject, OnInit } from '@angular/core';
import {FormBuilder, AbstractControl, ValidationErrors, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { User } from '../../interface/user.interface';
import { UserSessionService } from '../../../auth/services/user-session.service';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css',
})
export class UpdatePasswordComponent implements OnInit  {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  userSessionService = inject(UserSessionService);
  route = inject(Router);

  id : number = 0;
  user !: User;

  ngOnInit(): void {
    this.id = this.userSessionService.getUserId();
  }
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber;
    return valid ? null : { passwordStrength: true };
  }

  matchPasswords(group: FormGroup): ValidationErrors | null {
    const password = group.get('hashed_password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;

    return password === confirmPassword ? null : { matchPasswords: true };
  }

  formularioContra = this.fb.nonNullable.group(
    {
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      hashed_password: [
        '',[
          Validators.required,
          Validators.minLength(6),
          this.passwordValidator.bind(this),
          this.matchPasswords.bind(this),
        ],
      ],
      confirm_password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          this.passwordValidator.bind(this),
          this.matchPasswords.bind(this),
        ],
      ],
    }
  );

  updatePassword() {
    if (this.formularioContra.invalid) 
      return;

      const datos = {
        currentPassword: this.formularioContra.get('current_password')?.value,
        newPassword: this.formularioContra.get('confirm_password')?.value,
      };
      this.userService.changePassword(this.id, datos).subscribe({
        next: () => {
          Swal.fire({
            title: 'Contraseña actualizada correctamente!',
            icon: 'success',
          });
          console.log('nueva contraseña: ', datos.newPassword);
          this.route.navigate(['/profile']);
        },
        error: (err: Error) => {
          Swal.fire({
            title: 'Error al actualizar las contraseñas!',
            icon: 'error',
          });
          console.log('Error al actualizar las contraseñas.', err.message);
        },
      });
    }

}
