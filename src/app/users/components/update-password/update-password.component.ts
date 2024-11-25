import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, AbstractControl, ValidationErrors, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css',
})
export class UpdatePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private userSessionService = inject(UserSessionService);
  private route = inject(Router);

  id: number = 0;
  user !: User;
  showPassword1 = false;
  showPassword2 = false;
  showPassword3 = false;
  hasUpperCase: boolean = false;
  hasNumber: boolean = false;
  isLongEnough: boolean = false;
  type ?: string;

  ngOnInit(): void {
    this.id = this.userSessionService.getUserId();
    this.type = this.userSessionService.getUserType() as string;
  }

  formularioContra = this.fb.group(
    {
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      hashed_password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator.bind(this)]],
      confirm_password: ['', [Validators.required]]
    }, { validators: this.matchPasswords }
  );


  validatePassword() {
    const password = this.formularioContra.get('hashed_password')?.value || '';

    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.isLongEnough = password.length >= 8;
  }

  togglePasswordVisibility1(input: HTMLInputElement) {
    input.type = this.showPassword1 ? 'password' : 'text';
    this.showPassword1 = !this.showPassword1;
  }

  togglePasswordVisibility2(input: HTMLInputElement) {
    input.type = this.showPassword2 ? 'password' : 'text';
    this.showPassword2 = !this.showPassword2;
  }

  togglePasswordVisibility3(input: HTMLInputElement) {
    input.type = this.showPassword3 ? 'password' : 'text';
    this.showPassword3 = !this.showPassword3;
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

        if(this.type === 'user'){
          this.route.navigate(['/profile']);
        }
          this.route.navigate(['/admin-profile']);
      },
      error: (err: Error) => {
        Swal.fire({
          title: 'Contraseña actual incorrecta',
          icon: 'error',
        });
      },
    });
  }

}
