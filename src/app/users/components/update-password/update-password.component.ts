import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  AbstractControl,
  ValidationErrors,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css',
})
export class UpdatePasswordComponent {
  fb = inject(FormBuilder);
  userService = inject(UserService);
  route = inject(Router);

  flag = false;
  id : number = 0;

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

  formularioContra = this.fb.group(
    {
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      hashed_password: [
        '',
        [
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
    },
    { validators: this.matchPasswords }
  );

  updatePassword() {
    if (this.formularioContra.invalid) return;

    if (
      this.formularioContra.controls['hashed_password']?.value !== this.formularioContra.controls['confirm_password']?.value) {
      this.flag = true;
      return;
    } else {
      const datos = {
        currentPassword:
          this.formularioContra.controls['current_password'].value,
        newPassword: this.formularioContra.controls['confirm_password'].value,
      };
      this.userService.changePassword(this.id, datos).subscribe({
        next: () => {
          Swal.fire({
            title: 'Contraseña actualizada correctamente!',
            icon: 'success',
          });
          this.route.navigate(['/profile']);
        },
        error: (err: Error) => {
          console.log('Error al actualizar las contraseñas.', err.message);
        },
      });
    }
  }
}
