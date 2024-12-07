import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Account } from '@accounts/interface/account.interface';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-card-account',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './card-account.component.html',
  styleUrl: './card-account.component.css',
})
export class CardAccountComponent {
  // Inyección de dependencias
  private userSessionService = inject(UserSessionService);

  //Variables
  @Input()
  account!: Account;

  @Output()
  navigateEvent = new EventEmitter<string>();

  userId: number = this.userSessionService.getUserId();
  showBalance: boolean = false;

  // Funciones
  onNavigate() {
    this.navigateEvent.emit(String(this.account.id));
  }

  // Alterna la visibilidad del balance
  toggleBalance(event: Event): void {
    event.stopPropagation();
    this.showBalance = !this.showBalance;
  }
}
