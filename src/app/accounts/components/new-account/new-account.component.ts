import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import Swal from 'sweetalert2';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";

@Component({
  selector: 'app-new-account',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent],
  templateUrl: './new-account.component.html',
  styleUrl: './new-account.component.css'
})
export class NewAccountComponent {


  fb = inject(FormBuilder);
  accountService = inject(AccountService);
  userSessionService = inject(UserSessionService);
  user_id = this.userSessionService.getUserId();

  formulario = this.fb.nonNullable.group({
    account_type: ['', [Validators.required]],
  })

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

  createAccount() {

    let cuenta = {
      cbu: this.generateRandomCBU(),
      alias: this.generateRandomAlias(),
      account_type: this.formulario.get('account_type')?.value as string,
      user_id: this.user_id,
      overdraft_limit: 0
    };
    
    Swal.fire({
      title: `¿Está seguro que desea crear una nueva cuenta?`,
      icon: "warning",
      iconColor: "#0077b6",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, crear",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountService.createAccount(cuenta).subscribe({
          next: (account) => {
            Swal.fire({
              title: "Cuenta creada correctamente!",
              icon: "success"
            });
          },
          error: (err: Error) => {
            console.log(err.message);
          }
        });
      }
    });
  }

}

  