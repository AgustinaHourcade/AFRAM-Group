import { Account } from '@accounts/interface/account.interface';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';

@Component({
  selector: 'app-card-account',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './card-account.component.html',
  styleUrl: './card-account.component.css',
})
export class CardAccountComponent {

  // Dependency injections
  private userSessionService = inject(UserSessionService);

  //Variables
  @Input()
  account!: Account;

  @Output()
  navigateEvent = new EventEmitter<string>();

  userId: number = this.userSessionService.getUserId();
  showBalance: boolean = false;

  // Functions
  onNavigate() {
    this.navigateEvent.emit(String(this.account.id));
  }

  // Alter balance visibility
  toggleBalance(event: Event): void {
    event.stopPropagation();
    this.showBalance = !this.showBalance;
  }
}
