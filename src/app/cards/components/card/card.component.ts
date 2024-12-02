import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { CardService } from '@cards/service/card.service';
import { Card } from '@cards/interface/card';
import { UserSessionService } from '@auth/services/user-session.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { Account } from '@accounts/interface/account.interface';
import { AccountService } from '@accounts/services/account.service';

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
  // private route = inject (Router);
  // private cardsService = inject(CardService);

  borrar = false;
  cards!: Array<Card>;
  accounts!: Array<Account>;
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
        this.expiredCard();
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
      next: () => {
        Swal.fire({
          title: `Tarjeta eliminada correctamente!`,
          icon: 'success',
          confirmButtonColor: '#00b4d8',
          confirmButtonText: 'Aceptar',
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
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

  expiredCard(){
    let now = Date.now();
    for(let card of this.cards){
      const expirationDate = new Date(card.expiration_date)
      if(Number(expirationDate) < now && card.is_Active=='yes'){
        Swal.fire({
          title: `La tarjeta ${card.card_number} venció el ${expirationDate.toLocaleDateString()}.
          ¿Desea extenderla por 5 años?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#00b4d8',
          cancelButtonColor: "#e63946",
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            const newCard = {
              card_number: card.card_number,
              expiration_date: this.generarFechaExpiracion(),
              cvv: card.cvv,
              card_type: card.card_type,
              user_id: card.user_id,
              account_id: card.account_id
            };
            this.cardService.createCard(newCard).subscribe({
            next:()=>{
              this.cardService.disableCard(card.card_id).subscribe({
              next: ()=>{
              Swal.fire({
              title: 'Tarjeta extendida!',
              text: `La nueva fecha de expiracion es el ${newCard.expiration_date}.`,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#00b4d8'
            });
              }, error: (err:Error)=>{
                console.log(err.message);
              }
              })
            }, 
            error:(err :Error) =>{
              console.log(err.message);
            }
            })
          } else {
            console.log("El usuario no desea extender la tarjeta.");
          }
        });
      }
    }

  }

  generarFechaExpiracion(): string {
    const fechaOriginal = new Date(); 
    fechaOriginal.setFullYear(fechaOriginal.getFullYear() + 5); 
    return fechaOriginal.toISOString().split('T')[0]; 
  }
}
