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
  styleUrl: './newcard.component.css',
})
export class NewcardComponent implements OnInit {
  userSessionService = inject(UserSessionService);
  userService = inject(UserService);
  accountService = inject(AccountService);
  cardService = inject(CardService);
  route = inject(Router);

  userId !: number;
  user !: User;
  accounts?: Array<Account>;

  private fb = inject(FormBuilder);

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
        this.accounts = accounts;
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
          Swal.showValidationMessage(
            'Por favor, selecciona el tipo de tarjeta y la cuenta'
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
            title: 'Éxito',
            text: 'Tarjeta solicitada correctamente',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
          this.route.navigate(['/cards']);
        }
      },
      error: (e: Error) => {
        console.error('Error creating card:', e.message);
      },
    });
  }

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
        title: 'Error',
        text: 'Por favor, complete todos los campos requeridos.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
  
    
    const cardType = this.formulario.get('cardType')?.value as string;
    const account = this.formulario.get('account')?.value as number;
  
    this.createCard(cardType, account);
  }
  
}
