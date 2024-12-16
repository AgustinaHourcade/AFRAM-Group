import { Account } from '@accounts/interface/account.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { Router, RouterModule } from '@angular/router';
import { TransferModalComponent } from "@transactions/components/transfer-modal/transfer-modal.component";
import { Component, inject, OnInit } from '@angular/core';
import { TransferProgrammingComponent } from "@transactions/components/transfer-programming/transfer-programming.component";

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NavbarComponent, TransferModalComponent, CommonModule, TransferProgrammingComponent, RouterModule],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css'
})
export class TransactionsPageComponent implements OnInit{
  private router = inject(Router);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);

  accounts: Account[] = [];
  isModalOpen: boolean = false;
  appTransferModal: boolean = false;
  appTransferProgramming: boolean = false;

  userId = this.userSessionService.getUserId();

  ngOnInit(): void {
    this.cargarCuentas();
  }

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
      next: (accounts: Account[]) => this.accounts = accounts.filter(account => account.closing_date === null),
      error: (error: Error) => console.error('Error fetching accounts:', error)
    });
  }
}
