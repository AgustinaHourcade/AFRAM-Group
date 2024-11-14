import { UserSessionService } from './../../services/user-session.service';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
  showPassword = false;

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

  togglePasswordVisibility(input: HTMLInputElement) {
    input.type = this.showPassword ? 'password' : 'text';
    this.showPassword = !this.showPassword;
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

    // Llamamos a agregarCliente solo si el formulario es válido y las contraseñas coinciden
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
    console.log(user);
    this.userService.postUser(user).subscribe({
      next: (response) => {
        console.log('Usuario creado:', response);
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
}
