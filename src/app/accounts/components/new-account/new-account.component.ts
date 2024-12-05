import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { NavbarComponent } from "@shared/navbar/navbar.component";

@Component({
  selector: 'app-new-account',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarComponent],
  templateUrl: './new-account.component.html',
  styleUrl: './new-account.component.css'
})
export class NewAccountComponent {
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);
  private route = inject(Router)
  
  // Variables
  user_id: number = this.userSessionService.getUserId();
  flag : string =''; // Bandera que indica el tipo de cuenta seleccionada
  
  formulario = this.fb.nonNullable.group({
    account_type: ['', Validators.required], // Tipo de cuenta obligatorio
    currency: ['',Validators.required] // Divisa obligatoria
  })

  // Funciones
  // Generación de un CBU aleatorio de 22 dígitos
  generateRandomCBU() {
    let cbu = '';
    for (let i = 0; i < 22; i++) {
      cbu += Math.floor(Math.random() * 10).toString();
    }
    return cbu;
  }

  // Generación de un alias aleatorio de 14 caracteres
  generateRandomAlias() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let alias = '';
    for (let i = 0; i < 14; i++) {
      alias += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return alias;
  }

  createAccount() {
    // Se arma el objeto de la nueva cuenta con valores del formulario y aleatorios para CBU y alias
    let cuenta = {
      cbu: this.generateRandomCBU(),
      alias: this.generateRandomAlias(),
      account_type: this.formulario.get('account_type')?.value as string,
      user_id: this.user_id,
      overdraft_limit: 0,
      currency: this.formulario.get('currency')?.value as string
    };
    
    // Alerta de confirmación antes de crear la cuenta
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

  // Función para manejar el cambio de tipo de cuenta
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

  