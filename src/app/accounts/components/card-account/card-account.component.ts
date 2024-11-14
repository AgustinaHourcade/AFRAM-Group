import { UserSessionService } from './../../../auth/services/user-session.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Account } from '../../interface/account.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card-account',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './card-account.component.html',
  styleUrl: './card-account.component.css',
})
export class CardAccountComponent {
  @Input()
  account!: Account;

  @Output()
  navigateEvent = new EventEmitter<string>();

  userSessionService = inject(UserSessionService);
  userId: number = this.userSessionService.getUserId();

  onNavigate(){
    this.navigateEvent.emit(String(this.account.id));
  }
}
