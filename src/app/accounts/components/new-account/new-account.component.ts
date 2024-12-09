import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from "@shared/navbar/navbar.component";
import { Component, inject } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-account',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent],
  templateUrl: './new-account.component.html',
  styleUrl: './new-account.component.css'
})
export class NewAccountComponent {

  // Dependency injections
  private fb = inject(FormBuilder);
  private route = inject(Router)
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);

  // Variables
  flag: string =''; // Flag indicating the type of account selected
  user_id: number = this.userSessionService.getUserId();

  formulario = this.fb.nonNullable.group({
    account_type: ['', Validators.required],
    currency: ['',Validators.required]
  })

  // Functions

  // Generating a 22 digit random CBU
  generateRandomCBU() {
    let cbu = '';
    for (let i = 0; i < 22; i++) {
      cbu += Math.floor(Math.random() * 10).toString();
    }
    return cbu;
  }

  // Generating a random 14 character alias
  generateRandomAlias() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let alias = '';
    for (let i = 0; i < 14; i++) {
      alias += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return alias;
  }

  createAccount() {
    // The new account object is assembled with values ​​from the form and random values ​​for CBU and aliases
    let cuenta = {
      cbu: this.generateRandomCBU(),
      alias: this.generateRandomAlias(),
      account_type: this.formulario.get('account_type')?.value as string,
      user_id: this.user_id,
      overdraft_limit: 0,
      currency: this.formulario.get('currency')?.value as string
    };

    // Alert confirmation before the account has been created
    Swal.fire({
      title: `¿Está seguro que desea crear una nueva cuenta?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: "Si, crear",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountService.createAccount(cuenta).subscribe({
          next: (account) => {
            // Notificación de éxito
            Swal.fire({
              title: "Cuenta creada correctamente!",
              icon: "success",
              confirmButtonColor: '#00b4d8'
            });
            this.route.navigate(['/accounts'])
          },
          error: (err: Error) => console.log(err.message)
        });
      }
    });
  }

  // Function to handle account type change
  onAccountTypeChange(): void {
    const accountType = this.formulario.get('account_type')?.value;

    if (accountType === 'Checking') {
      this.flag = 'ars'
      this.formulario.get('currency')?.setValue('ars');
    } else if (accountType === 'Savings') {
      this.flag = 'all';
    }
  }
}

