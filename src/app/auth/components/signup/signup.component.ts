import { UserSessionService } from './../../services/user-session.service';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';
import { User } from '../../../users/interface/user.interface';
import { UserService } from '../../../users/services/user.service';
import { Router } from '@angular/router';
import { AccountService } from '../../../accounts/services/account.service';
import { Account } from '../../../accounts/interface/account.interface';
import { AddressService } from '../../../addresses/service/address.service';
import { Address } from '../../../addresses/interface/address.interface';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent{
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
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.minLength(7), Validators.maxLength(8)]],
      hashed_password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator.bind(this)]],
      confirm_password: ['', [Validators.required]]
    },
    { validators: this.matchPasswords }
  );

  validatePassword() {
    const password = this.formulario.get('hashed_password')?.value || '';
  
    this.hasUpperCase = /[A-Z]/.test(password); // Verifica que tenga al menos una letra mayúscula
    this.hasNumber = /\d/.test(password); // Verifica que tenga al menos un número
    this.isLongEnough = password.length >= 8; // Verifica longitud mínima
  }

  // togglePasswordVisibility(field: 'password' | 'confirm'): void {
  //   if (field === 'password') {
  //     this.showPassword1 = !this.showPassword1;
  //   } else if (field === 'confirm') {
  //     this.showPassword2 = !this.showPassword2;
  //   }
  // }

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
      return;
    }

    const { confirm_password, ...user } = this.formulario.getRawValue();
    const user1 = {
      isActive: 'yes',
      user_type: 'user',
      ...user
    };

    this.agregarCliente(user1 as User);
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

  createAccount(id: number) {
    let cuenta = {
      cbu: this.generateRandomCBU(),
      alias: this.generateRandomAlias(),
      account_type: 'Savings',
      user_id: id,
      overdraft_limit: 0
    };
    this.accountService.createAccount(cuenta).subscribe({
      next: (id) => {
        console.log("Caja de ahorros creada, id = " + id);
      },
      error: (error: Error) => {
        console.log(error.message);
      }
    });
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

  agregarCliente(user: User) {
    this.userService.postUser(user).subscribe({
      next: (response) => {
        this.sesionService.setUserId(response);
        this.createAccount(response);
        this.createAddress(response);
        this.route.navigate(['update-profile/', response]);
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

    // Listen to value changes to update validation status
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
