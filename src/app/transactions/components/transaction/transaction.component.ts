import { Component, inject, Input, OnInit } from '@angular/core';
import { Transaction } from '../../interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { ReceiptComponent } from '../receipt/receipt.component';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReceiptComponent],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent  implements OnInit{
  @Input() transaction!: Transaction;
  @Input() selectedAccountId!: number;

  ownAccountsId: number[] = [];
  destinatario: string = '';
  flag: boolean = false;
  id ?:number;

  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);

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
    this.id = Number(this.userSessionService.getUserId());

    this.accountService.getAccountsByIdentifier(this.id).subscribe({
      next: (accounts) => {
        this.ownAccountsId = accounts.map(account => account.id);
      },
      error: (error) => {
        console.error('Error al obtener las cuentas', error);
      }
    });
  }

  isIncoming(sourceId: number): boolean {
    if(sourceId === this.selectedAccountId){
      return false;
    }
    return true;
  }


}
