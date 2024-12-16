import Swal from 'sweetalert2';
import { Account } from '@accounts/interface/account.interface';
import { RouterLink } from '@angular/router';
import { CardService } from '@cards/service/card.service';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit {

  private cardService = inject(CardService);
  private sesionService = inject(UserSessionService);
  private accountService = inject(AccountService);

  cards!: any[];
  borrar: boolean  = false;
  userId: number = this.sesionService.getUserId();
  accounts!: Account[];
  activeCards: any[] = [];
  showNumbers: boolean = false;

  ngOnInit(): void {
    this.getCards();
    this.getAccounts();
  }

  getAccounts(){
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => this.accounts = accounts,
      error: (error: Error) => console.error('Error fetching accounts:', error)
    });
  }

  getCards(){
    this.activeCards = [];
    this.cardService.getCardsById(this.userId).subscribe({
      next: (cards) => {
        this.cards = cards;
        cards.forEach((card) => {
          if (card.is_Active === 'yes') {
            this.activeCards.push(card);
            this.activeCards = this.activeCards.map((card) => ({
              ...card,
              showNumbers: false // Inicialmente todas ocultas
            }));
          }
        });
      },
      error: (e: Error) => console.log(e.message)
    });
  }

  deactivate(card_id: number) {
    this.cardService.disableCard(card_id).subscribe({
      next: () => {
        Swal.fire({
          title: `Tarjeta eliminada correctamente!`,
          icon: 'success',
          confirmButtonColor: '#00b4d8',
          confirmButtonText: 'Aceptar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.getCards();
          }
        });
        },
      error: (e: Error) => console.log(e.message)
    });
  }

  alerta(card_id: number) {
    Swal.fire({
      title: `¿Está seguro que desea dar de baja esta tarjeta?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: 'Si, desactivar tarjeta',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deactivate(card_id);
      }
    });
  }

  toggleVisibility(card: any): void {
    card.showNumbers = !card.showNumbers;
  }
}
