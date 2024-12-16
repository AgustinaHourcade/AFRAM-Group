import { Transaction } from '@transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { ReceiptComponent } from '@transactions/components//receipt/receipt.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReceiptComponent],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent  implements OnInit{

  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);

  @Input() transaction!: Transaction;
  @Input() selectedAccountId!: number;
  @Input() isDownloading = false;
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();

  ownAccountsId: number[] = [];
  // destinatario = '';
  flag: boolean = false;
  id ?:number;

  ngOnInit(): void {
    this.getUserAccounts();
  }

  toggleFlag(): void {
    this.toggle.emit(); // Notifica al padre
  }

  getUserAccounts(): void {
    this.id = Number(this.userSessionService.getUserId());

    this.accountService.getAccountsByIdentifier(this.id).subscribe({
      next: (accounts) => this.ownAccountsId = accounts.map(account => account.id),
      error: (error) => console.error('Error al obtener las cuentas', error)
    });
  }

  isIncoming(sourceId: number): boolean {
    if(sourceId === this.selectedAccountId){
      return false;
    }
    return true;
  }

  constructor(private renderer: Renderer2, private elRef: ElementRef) {}

  applyPDFStyles(apply: boolean, element: HTMLElement): void {
    if (apply) {
      this.renderer.addClass(element, 'pdf-styles');
    } else {
      this.renderer.removeClass(element, 'pdf-styles');
    }
  }

}
