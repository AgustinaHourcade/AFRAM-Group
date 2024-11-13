import { User } from '../../../users/interface/user.interface';
import { Component, inject, OnInit } from '@angular/core';
import { UserSessionService } from '../../../auth/services/user-session.service';
import Swal from 'sweetalert2';
import { UserService } from '../../../users/services/user.service';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardService } from '../../service/card.service';

@Component({
  selector: 'app-newcard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  templateUrl: './newcard.component.html',
  styleUrl: './newcard.component.css'
})
export class NewcardComponent implements OnInit {

  sessionService = inject(UserSessionService);
  userService = inject(UserService);
  accountService = inject(AccountService);
  cardService = inject(CardService);
  user_id = this.sessionService.getUserId();
  route = inject(Router)
  user!: User;
  accounts?: Array<Account>;

  private fb = inject(FormBuilder);

  formulario = this.fb.nonNullable.group(
    {
    cardType: ['',Validators.required],
    account: [0, Validators.required]
    }
  )

  ngOnInit(): void {
    this.userService.getUser(this.user_id).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    });



    this.accountService.getAccountsByIdentifier(this.user_id).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        console.log(this.accounts);
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });

  }
    newCard(): void {
      Swal.fire({
        title: 'Selecciona Tipo de Tarjeta y Cuenta',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        preConfirm: () => {
          const cardType = this.formulario.get('cardType')?.value;
          const account = this.formulario.get('account')?.value;

          if (!cardType || !account) {
            Swal.showValidationMessage('Por favor, selecciona el tipo de tarjeta y la cuenta');
            return false;
          }

          return { cardType, account };
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const { cardType, account } = result.value;
          console.log('Tipo de tarjeta:', cardType);
          console.log('Cuenta asociada:', account);
        }
      });
    }

    onSubmit(): void {
    console.log('ID ACCOUNT: ' +  this.formulario.get('account')?.value);
      const card = {
        card_number: this.generarNumeroTarjeta(),
        expiration_date: this.generarFechaExpiracion(),
        cvv: this.generarCVV() ,
        card_type: this.formulario.get('cardType')?.value,
        user_id: this.user_id,
        account_id: this.formulario.get('account')?.value
      }

      this.cardService.createCard(card).subscribe({
        next: (creada) => {
          if(creada) console.log('Tarjeta creada')
        },
        error: (e : Error) =>{
          console.log(e.message);
        }
      })

      Swal.fire({
        title: 'Éxito',
        text: 'Tarjeta solicitada correctamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });


      this.route.navigate(['/cards']);
    }

    generarNumeroTarjeta(): string {
      const sufijoAleatorio = Math.floor(Math.random() * 100000000); // Genera un número aleatorio de 8 dígitos
      const numeroBase = "44101400"; // El número base sin espacios
      return `${numeroBase}${sufijoAleatorio.toString().padStart(8, '0')}`; // Concatenar sin espacios
    }

    generarCVV(): number {
      const cvv = Math.floor(100 + Math.random() * 900); // Genera un número aleatorio entre 100 y 999
      return cvv; // Devuelve el número como cadena
    }

    generarFechaExpiracion(): string {
      const fechaOriginal = new Date(); // Convierte la fecha recibida en un objeto Date
      fechaOriginal.setFullYear(fechaOriginal.getFullYear() + 5); // Suma 5 años
      return fechaOriginal.toISOString().split('T')[0]; // Devuelve la fecha en formato 'YYYY-MM-DD'
    }

}
