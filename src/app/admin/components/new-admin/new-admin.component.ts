import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { Router } from '@angular/router';
import { Account } from '@accounts/interface/account.interface';
import { Address } from '@addresses/interface/address.interface';
import { UserService } from '@users/services/user.service';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { AddressService } from '@addresses/service/address.service';
import { Component, inject } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';
import { ReactiveFormsModule, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-new-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarAdminComponent],
  templateUrl: './new-admin.component.html',
  styleUrl: './new-admin.component.css'
})
export class NewAdminComponent {
  private fb = inject(FormBuilder);
  private route = inject(Router);
  private userService = inject(UserService);
  private sesionService = inject(UserSessionService);
  private accountService = inject(AccountService);
  private addressService = inject(AddressService);

  account!: Account;
  hasNumber: boolean = false;
  hasUpperCase: boolean = false;
  isLongEnough: boolean = false;
  passwordForm: FormGroup;
  showPassword1: boolean = false;
  showPassword2: boolean = false;

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

  preventNumbers(event: KeyboardEvent): void {
    const regex = /[0-9]/;
    if (regex.test(event.key)) {
      event.preventDefault();
    }
  }

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

    this.hasUpperCase = /[A-Z]/.test(password);
    this.hasNumber = /\d/.test(password);
    this.isLongEnough = password.length >= 8;
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
        text: 'Por favor, complete todos los campos.',
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
      error: (error: Error) => console.error('Error al crear dirección:', error.message)
    });
  }

  // Funtion to create a new admin or user
  agregarAdmin(user: User) {
  let tipo: string;

    this.userService.postCompleteUser(user).subscribe({
      next: (response) => {
        // this.sesionService.setUserId(response);
        this.createAddress(response);

        if(user.user_type === 'admin'){
          tipo = 'administrador'
        }else{
          tipo = 'usuario'
          this.createAccount(response);
        }

          Swal.fire({
            title: 'Nuevo ' + tipo +  ' creado correctamente!',
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
      error: (error: Error) => console.error('Error al crear usuario:', error)
    });
  }

  generateRandomCBU() {
    let cbu = '';
    for (let i = 0; i < 22; i++) {
      cbu += Math.floor(Math.random() * 10).toString();
    }
    return cbu;
  }

  generateRandomAlias() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let alias = '';
    for (let i = 0; i < 14; i++) {
      alias += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return alias;
  }

  createAccount(id: number): Account {
    const cuenta = {
      cbu: this.generateRandomCBU(),
      alias: this.generateRandomAlias(),
      account_type: 'Savings',
      user_id: id,
      overdraft_limit: 0,
      currency: 'ars'
    };
    this.accountService.createAccount(cuenta).subscribe({
      error: (error: Error) => console.log(error.message)
    });

    return cuenta as Account;
  }

  updatePasswordValidation(password: string): void {
    this.passwordValidation = {
      containsNumber: /\d/.test(password),
      containsUppercase: /[A-Z]/.test(password),
      validLength: password.length >= 8,
    };
  }
}
