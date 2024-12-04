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
  // Dependency Injection
  private userSessionService = inject(UserSessionService); // Service to get session data.

  //Variables
  @Input()
  account!: Account;

  @Output()
  navigateEvent = new EventEmitter<string>();

  userId: number = this.userSessionService.getUserId();
  showBalance: boolean = false;

  onNavigate() {
    this.navigateEvent.emit(String(this.account.id));
  }

  // Toggles balance´s visibility
  toggleBalance(event: Event): void {
    event.stopPropagation();
    this.showBalance = !this.showBalance;
  }
}
