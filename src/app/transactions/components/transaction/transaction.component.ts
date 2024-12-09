import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '@transactions/interface/transaction.interface';
import { ReceiptComponent } from '@transactions/components//receipt/receipt.component';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';

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
  @Input() isDownloading: boolean = false;

  ownAccountsId: number[] = [];
  destinatario: string = '';
  flag: boolean = false;
  id ?:number;

  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);

  ngOnInit(): void {
    this.getUserAccounts();
  }

  @Input() isOpen: boolean = false;
  @Output() toggle = new EventEmitter<void>();
  
  toggleFlag(): void {
    this.toggle.emit(); // Notifica al padre
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

  constructor(private renderer: Renderer2, private elRef: ElementRef) {}


  applyPDFStyles(apply: boolean, element: HTMLElement): void {
    if (apply) {
      this.renderer.addClass(element, 'pdf-styles');
    } else {
      this.renderer.removeClass(element, 'pdf-styles');
    }
  }

}
