import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AccountService } from '../../services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { CardAccountComponent } from '../../components/card-account/card-account.component';
import { CbuAliasComponent } from '../../components/cbu-alias/cbu-alias.component';
import { Account } from '../../interface/account.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NavbarComponent, CardAccountComponent, CbuAliasComponent],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent {
  accounts: Array<Account> = [];
  userId: number = 0;

  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();

    this.accountService.getAccountsByIdentifier(Number(this.userId)).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      }
    });

  }
  
  changeAccount(){
    

  }

}
