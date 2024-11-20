import { Component, inject, OnInit } from '@angular/core';
import { CardService } from '../../service/card.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Card } from '../../interface/card';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import Swal from 'sweetalert2';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, RouterLink, CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit {
  private sesionService = inject(UserSessionService);
  private cardService = inject(CardService);
  private accountService = inject(AccountService);
  private route = inject (Router);
  borrar = false;
  cards!: Array<Card>;
  accounts!: Array<Account>;
  cardsService = inject(CardService);
  userId = this.sesionService.getUserId();
  activeCards: Array<Card> = [];

  ngOnInit(): void {
    this.cardService.getCardsById(this.userId).subscribe({
      next: (cards) => {
        this.cards = cards;
        cards.forEach((card) => {
          if (card.is_Active === 'yes') {
            this.activeCards.push(card);
          }
        });
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });

    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }

  deactivate(card_id: number) {
    this.cardService.disableCard(card_id).subscribe({
      next: (flag) => {
        Swal.fire({
          title: 'Tarjeta desactivada!',
          icon: 'success',
        });
        this.route.navigate(['main']);
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }

  alerta(card_id: number) {
    Swal.fire({
      title: `¿Está seguro que desea dar de baja esta tarjeta?`,
      icon: 'warning',
      iconColor: '#0077b6',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, desactivar tarjeta',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deactivate(card_id);
      }
    });
  }
}
