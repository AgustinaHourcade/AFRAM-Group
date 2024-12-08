import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { CardService } from '@cards/service/card.service';
import { UserService } from '@users/services/user.service';
import { Account } from '@accounts/interface/account.interface';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-newcard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, RouterLink],
  templateUrl: './newcard.component.html',
  styleUrl: './newcard.component.css',
})
export class NewcardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(Router);
  private userService = inject(UserService);
  private cardService = inject(CardService);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);

  user !: User;
  userId !: number;
  accounts?: Array<Account>;

  formulario = this.fb.nonNullable.group({
    cardType: ['', Validators.required],
    account: [0, Validators.required],
  });

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    this.loadUserData();
    this.loadAccounts();
  }

  loadUserData(): void {
    this.userService.getUser(this.userId).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (e: Error) => {
        console.error('Error fetching user data:', e.message);
      },
    });
  }

  loadAccounts(): void {
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts.filter(account => account.closing_date == null);
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }

  // Funtion to generate a new card
  newCard(): void {
    Swal.fire({
      title: 'Selecciona Tipo de Tarjeta y Cuenta.',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#00b4d8',
      preConfirm: () => {
        const cardType = this.formulario.get('cardType')?.value;
        const account = this.formulario.get('account')?.value;

        if (!cardType || !account) {
          Swal.showValidationMessage(
            'Por favor, selecciona el tipo de tarjeta y la cuenta.'
          );
          return false;
        }

        return { cardType, account };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { cardType, account } = result.value;
        this.createCard(cardType, account);
      }
    });
  }

  createCard(cardType: string, account: number): void {
    const card = {
      card_number: this.generarNumeroTarjeta(),
      expiration_date: this.generarFechaExpiracion(),
      cvv: this.generarCVV(),
      card_type: cardType,
      user_id: this.userId,
      account_id: account,
    };

    this.cardService.createCard(card).subscribe({
      next: (creada) => {
        if (creada) {
          Swal.fire({
            title: 'Tarjeta solicitada correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
          });
          this.route.navigate(['/cards']);
        }
      },
      error: (e: Error) => {
        console.error('Error creating card:', e.message);
      },
    });
  }

  // Funtion to generate the number card
  generarNumeroTarjeta(): string {
    const sufijoAleatorio = Math.floor(Math.random() * 100000000);
    const numeroBase = '44101400';
    return `${numeroBase}${sufijoAleatorio.toString().padStart(8, '0')}`;
  }

  generarCVV(): number {
    return Math.floor(100 + Math.random() * 900);
  }

  generarFechaExpiracion(): string {
    const fechaOriginal = new Date();
    fechaOriginal.setFullYear(fechaOriginal.getFullYear() + 5);
    return fechaOriginal.toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.formulario.invalid) {
      Swal.fire({
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8'
      });
      return;
    }

    const cardType = this.formulario.get('cardType')?.value as string;
    const account = this.formulario.get('account')?.value as number;

    this.createCard(cardType, account);
  }

}
