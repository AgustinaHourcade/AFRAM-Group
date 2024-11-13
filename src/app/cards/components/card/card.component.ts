import { Component, inject, OnInit } from '@angular/core';
import { CardService } from '../../service/card.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Card } from '../../interface/card';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent implements OnInit{
  
private sesionService = inject(UserSessionService);
private cardService = inject(CardService);
cards ?: Array<Card>;

userId = this.sesionService.getUserId();

ngOnInit(): void {
  this.cardService.getCardsById(this.userId).subscribe({
    next: (cards) => {
      console.log("Tarjetas" + cards);
      this.cards = cards;
    },
    error: (e: Error) =>{
      console.log(e.message);
    }
  })
}


}
