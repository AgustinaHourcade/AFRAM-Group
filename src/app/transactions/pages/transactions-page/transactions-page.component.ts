import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { TransferModalComponent } from "@transactions/components/transfer-modal/transfer-modal.component";
import { TransferProgrammingComponent } from "@transactions/components/transfer-programming/transfer-programming.component";
import { AccountService } from '@accounts/services/account.service';
import { Account } from '@accounts/interface/account.interface';
import { UserSessionService } from '@auth/services/user-session.service';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NavbarComponent, TransferModalComponent, CommonModule, TransferProgrammingComponent, RouterModule],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css'
})
export class TransactionsPageComponent implements OnInit{
  isModalOpen = false;
  appTransferProgramming = false;
  appTransferModal = false;
  accounts: Array<Account> = [];

  ngOnInit(): void {
    this.cargarCuentas();
  }

  private router = inject(Router);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);

  userId = this.userSessionService.getUserId();

  openModal() {
    this.isModalOpen = true;
  }
  goToNewTransfer(account: any) {
    this.isModalOpen = false;
    this.router.navigate(['/transactions/new-transfer'], { state: { account } });
  }

  openAppTransferProgramming(){
    this.appTransferProgramming = true;
  }

  openAppTransferModal(){
    this.appTransferModal = true;
  }

  closeAppTransferProgramming(){
    this.appTransferProgramming = false;
  }

  closeAppTransferModal(){
    this.appTransferModal = false;
  }

  cargarCuentas() {
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts.filter(account => account.closing_date === null);
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }

  
}
