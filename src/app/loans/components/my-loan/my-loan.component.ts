import { Component, inject, Input, OnInit } from '@angular/core';
import { Transaction } from '../../../transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { ReceiptLoanComponent } from '../receipt-loan/receipt-loan.component';

@Component({
  selector: 'app-my-loan',
  standalone: true,
  imports: [CommonModule, ReceiptLoanComponent],
  templateUrl: './my-loan.component.html',
  styleUrl: './my-loan.component.css'
})
export class MyLoanComponent  implements OnInit{
  @Input() transaction!: Transaction; 
  ownAccountsId: number[] = []; 
  destinatario: string = '';
  flag: boolean = false;

  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);

  ngOnInit(): void {
    this.getUserAccounts();
  }

  toggleFlag(): void {
    this.flag = !this.flag;
  }

  onCancel(): void {
    this.flag = false; 
  }
  getUserAccounts(): void {
    const userId = Number(this.userSessionService.getUserId());

    this.accountService.getAccountsByIdentifier(userId).subscribe({
      next: (accounts) => {
        this.ownAccountsId = accounts.map(account => account.id); 
      },
      error: (error) => {
        console.error('Error al obtener las cuentas', error);
      }
    });
  }

  isIncoming(): boolean {
    return this.ownAccountsId.includes(this.transaction.destination_account_id); 
  }

  get formattedAmount(): string {
    const sign = this.isIncoming() ? '+ ' : '- ';
    return `${sign}$${this.transaction.amount}`;
  }

}

