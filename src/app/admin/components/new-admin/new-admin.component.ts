import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { Address } from '../../../addresses/interface/address.interface';
import { AddressService } from '../../../addresses/service/address.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { User } from '../../../users/interface/user.interface';
import { UserService } from '../../../users/services/user.service';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-new-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarAdminComponent],
  templateUrl: './new-admin.component.html',
  styleUrl: './new-admin.component.css'
})
export class NewAdminComponent {

  account!: Account;
  showPassword1 = false;
  showPassword2 = false;
  hasUpperCase: boolean = false;
  hasNumber: boolean = false;
  isLongEnough: boolean = false;

  fb = inject(FormBuilder);
  sesionService = inject(UserSessionService);
  userService = inject(UserService);
  accountService = inject(AccountService);
  addressService = inject(AddressService);
  route = inject(Router);

  formulario = this.fb.group(
    {
      name_user: ['', [Validators.required, Validators.minLength(4)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      real_name: ['', [Validators.required, Validators.minLength(4)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$'), this.minLengthValidator(7), this.maxLengthValidator(8)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      hashed_password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator.bind(this)]],
      confirm_password: ['', [Validators.required]],
      user_type : ['', Validators.required]
    },
    { validators: this.matchPasswords }
  );

  minLengthValidator(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const valueAsString = value ? value.toString() : '';

      if (valueAsString.length < minLength) {
        return { minLength: { value: control.value } };
      }
      return null;
    };
  }

  maxLengthValidator(maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const valueAsString = value ? value.toString() : '';

      if (valueAsString.length > maxLength) {
        return { maxLength: { value: control.value } };
      }
      return null;
    };
  }
  validatePassword() {
    const password = this.formulario.get('hashed_password')?.value || '';

    this.hasUpperCase = /[A-Z]/.test(password); // Verifica que tenga al menos una letra mayúscula
    this.hasNumber = /\d/.test(password); // Verifica que tenga al menos un número
    this.isLongEnough = password.length >= 8; // Verifica longitud mínima
  }

  togglePasswordVisibility(input: HTMLInputElement) {
    input.type = this.showPassword1 ? 'password' : 'text';
    this.showPassword1 = !this.showPassword1;
  }

  togglePasswordVisibilityRepet(input: HTMLInputElement) {
    input.type = this.showPassword2 ? 'password' : 'text';
    this.showPassword2 = !this.showPassword2;
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


  addUsuario() {
    if (this.formulario.invalid) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete todos los campos',
        icon: 'error',
      })
      return;
    }


    const { confirm_password, ...user } = this.formulario.getRawValue();

    this.agregarAdmin(user as User);
  }


  createAddress(id: number) {
    const address = {} as Address;
    this.addressService.createAddress(id, address).subscribe({
      next: (addressId) => {
        console.log('Dirección creada, id = ' + addressId);
      },
      error: (error: Error) => {
        console.error('Error al crear dirección:', error.message);
      }
    });
  }

  agregarAdmin(user: User) {
  let tipo: string;

    this.userService.postCompleteUser(user).subscribe({
      next: (response) => {
        this.sesionService.setUserId(response);
        this.createAddress(response);

        if(user.user_type === 'admin'){
          tipo = 'administrador'
        }else{
          tipo= 'usuario'
        }

          Swal.fire({
            title: 'Nuevo ' + tipo +  ' creado correctamente.',
            icon: 'success',
          }).then((result) => {
          if (result.isConfirmed) {
            if(user.user_type === 'admin'){
              this.route.navigate(['list-admins']);
            }else{
              this.route.navigate(['list-users']);
            }
          }
        })
      },
      error: (error: Error) => {
        console.error('Error al crear usuario:', error);
      }
    });
  }

  passwordForm: FormGroup;

  passwordValidation = {
    containsNumber: false,
    containsUppercase: false,
    validLength: false,
  };

  constructor(private fb2: FormBuilder) {
    this.passwordForm = this.fb2.group({
      password: ['', Validators.required],
    });


    this.passwordForm.get('password')?.valueChanges.subscribe(value => {
      this.updatePasswordValidation(value);
    });
  }

  updatePasswordValidation(password: string): void {
    this.passwordValidation = {
      containsNumber: /\d/.test(password),
      containsUppercase: /[A-Z]/.test(password),
      validLength: password.length >= 8,
    };
  }
}