import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CardAccountComponent } from '../../accounts/components/card-account/card-account.component';
import { TransactionComponent } from '../../transactions/components/transaction/transaction.component';
import { AccountService } from '../../accounts/services/account.service';
import { UserSessionService } from '../../auth/services/user-session.service';
import { TransactionService } from '../../transactions/services/transaction.service';
import { Transaction } from '../../transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Account } from '../../accounts/interface/account.interface';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { Card } from '../../cards/interface/card';
import { CardService } from '../../cards/service/card.service';
import { DolarComponent } from "../../shared/dolar/components/dolar.component";
import { FixedTermService } from '../../fixedTerms/service/fixed-term.service';
import { FixedTerm } from '../../fixedTerms/interface/fixed-term';
import Swal from 'sweetalert2';
import { NotificationsService } from '../../notifications/service/notifications.service';
import { Notification } from '../../notifications/interface/notification';


@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NavbarComponent, CardAccountComponent, TransactionComponent, CommonModule, DolarComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})

export class MainPageComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Array<Transaction> = [];
  allTransactions: Array<Transaction> = [];
  cards: Array<Card> = [];
  fixedTerms: Array<FixedTerm> = [];
  userId: number = 0;
  showActions = false;
  activeCards: Array<Card> = [];
  activeAccounts: Array<Account> = [];
  pageSize = 4 ;
  currentPage = 1;
  selectedAccountId !: number;

  // private router = inject(Router);
  private changeDetector = inject(ChangeDetectorRef);
  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private cardService = inject(CardService);
  private fixedTermService = inject(FixedTermService);
  private notificationService = inject(NotificationsService);

  get totalPages(): number {
    return Math.ceil(this.transactions.length / this.pageSize);
  }

  get paginatedTransactions() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.transactions.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    this.getAccounts();
    this.verifyFixedTerms();
    this.getCards();
  }


  private getAccounts() {
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = [];
        this.transactions = [];
        this.accounts = accounts;
        accounts.forEach((account) => {
          if (!account.closing_date) {
            this.activeAccounts.push(account);
          }
        });
        this.verifyTransferProgramming();
      },
      error: (error: Error) => {
        console.error(error.message);
      },
    });
  }


  private verifyFixedTerms() {
    this.fixedTermService.getFixedTerms().subscribe({
      next: (fixedTerms) => {
        this.fixedTerms = fixedTerms;
        let accountsUpdated = false;
        this.fixedTerms.forEach((item) => {
          if (item.is_paid === 'no' && this.compareDateWithNow(item.expiration_date)) {
            accountsUpdated = true;
            this.processFixedTerm(item);
          }
        });
        if (accountsUpdated) {
          this.getAccounts();
        }
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });
  }


  private processFixedTerm(item: FixedTerm) {
    const amount = Number(item.invested_amount) + Number(item.interest_earned);
    this.accountService.updateBalance(amount, item.account_id).subscribe({
      next: (flag) => {
        if (flag) {
          this.markFixedTermAsPaid(item, amount);
        }
        const descontar = -1 * amount;
        this.accountService.updateBalance(descontar, 1).subscribe({
          next: ()=>{
            console.log('saldo actualizado en la cuenta 1 del banco');
          }, error : (err:Error)=>{
            console.log(err.message);
          }
        })
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });
  }

  private markFixedTermAsPaid(item: FixedTerm, amount: number) {
    this.fixedTermService.setPayFixedTerms(item.id as number).subscribe({
      next: () => {
        this.createFixedTermTransaction(item, amount);
      },
      error: (error: Error) => {
        console.error('Error marking fixed term as paid:', error);
      },
    });
  }

  private createFixedTermTransaction(item: FixedTerm, amount: number) {
    const transaction = {
      amount: amount,
      source_account_id: 1, // Verifica si este ID es correcto
      destination_account_id: item.account_id,
      transaction_type: 'fixed term',
    };

    console.log('Posting transaction:', transaction);

    this.transactionService.postTransaction(transaction as Transaction).subscribe({
      next: () => {
        this.showFixedTermSuccessAlert();
      },
      error: (error: Error) => {
        console.log('Error posting transaction:', error.message);
      },
    });
  }
  private showFixedTermSuccessAlert() {

    const notification = {
      title: 'Plazo fijo acreditado!',
      message: 'Puede ver el comprobante en la seccion "Mis movimientos"',
      user_id: this.userId
    }

    this.postNotification(notification)
  }

  private postNotification(notification: any){
    this.notificationService.postNotification(notification).subscribe({
      next: (flag) =>{
        if(flag){
          console.log('Notificacion enviada');
        }
      },
      error: (e: Error)=>{
        console.log(e.message);
      }
    })
  }

  private getCards(){
    this.cardService.getCardsById(this.userId).subscribe({
      next: (cards) => {
        this.cards = cards;
        cards.forEach((card) => {
          if (card.is_Active === 'yes') {
            this.activeCards.push(card);
          }
        });
      },
      error: (error: Error) => {
        console.log(error.message);
      },
    });
  }

  toggleActions(div: HTMLDivElement) {
    div.style.display = this.showActions ? 'flex' : 'none';
    this.showActions = !this.showActions;
  }

  compareDateWithNow(dateString: string): boolean {
    const dateFromDatabase = new Date(dateString);
    const currentDate = new Date();

    return dateFromDatabase <= currentDate;
  }

  private loadTransactions(accountId: number): Observable<Transaction[]> {
    return this.transactionService.getTransactionsByAccountId(accountId).pipe(
      catchError((error: Error) => {
        console.error(
          `Error loading transactions for account ${accountId}:`,
          error
        );
        return of([]);
      })
    );
  }

  onAccountSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const selectedAccountId = Number(target.value);
      this.selectedAccountId = selectedAccountId;
      console.log('ID de la cuenta seleccionada:', selectedAccountId);
    }
    this.transactions = [];
    this.currentPage = 1;

    this.loadTransactions(this.selectedAccountId).subscribe({
      next: (transactions: Transaction[]) => {
        transactions.forEach((transaction) => {
          if (transaction.is_paid === 'yes') {
            this.transactions.push(transaction);
          }
        });

        this.changeDetector.detectChanges();

        setTimeout(() => {
          this.scrollToBottom();
        }, 50);
      },
      error: (error: Error) => {
        console.error(`Error loading transactions for account ${this.selectedAccountId}:`, error);
      },
    });
  }

  scrollToBottom() {
    const lastElement = document.querySelector('.transactions-page:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }



  private verifyTransferProgramming() {
    this.activeAccounts.forEach((account) => {
      this.loadTransactions(account.id).subscribe({
        next: (transactions) => {
          this.allTransactions = [];
          transactions.forEach((transaction) => {
            if (!this.allTransactions.some((t) => t.id === transaction.id)) {
              this.allTransactions.push(transaction);
          }
        })
          this.allTransactions.forEach((item) => {
            if (item.is_paid === 'no' && this.compareDateWithNow(item.transaction_date.toString())) {
              this.processTransferProgramming(item);
              this.markTransferProgrammingAsPaid(item);
            }
          });
        },
        error: (err: Error) => {
          console.log(err.message);
        },
      });
    });

  }


  private processTransferProgramming(item: Transaction) {
    const amount = Number(item.amount);
    console.log('Monto a trans: ',amount);
    const descAmount = -1 * amount
    const updateSourceAccount$ = this.accountService.updateBalance(descAmount, item.source_account_id);
    const updateDestinationAccount$ = this.accountService.updateBalance(amount, item.destination_account_id);

    forkJoin([updateSourceAccount$, updateDestinationAccount$]).subscribe({
      next: ([sourceUpdated, destinationUpdated]) => {
        if (sourceUpdated && destinationUpdated) {
        } else {
          console.error('Error actualizando saldos en las cuentas. Transferencia no completada.');
        }
      },
      error: (err) => {
        console.error('Error procesando la transferencia programada:', err);
      },
    });
  }


private markTransferProgrammingAsPaid(item: Transaction) {
  this.transactionService.setPayTransferProgramming(Number(item.id)).subscribe({
    next: () => {
      this.sendTransferSourceNotification(item.source_account_id)
      this.sendTransferDestinationNotification(item.destination_account_id)
      this.getAccounts();
    },
    error: (error: Error) => {
      console.error('Error al marcar la transferencia como pagada:', error);
    },
  });
}

private sendTransferSourceNotification(id: number) {
  let user_id = 0;
  this.accountService.getAccountById(id).subscribe({
    next: (account) =>{
      user_id = account.user_id
    },
    error: (e: Error)=>{
      console.log(e.message);
    }
  })

  const notification = {
    title: 'Se realizo una transferencia programada!',
    message: 'Se le debito una transferencia que programó, puede ver el detalle en la seccion "Mis movimientos"',
    user_id: user_id
  }

  this.postNotification(notification)
}

private sendTransferDestinationNotification(id: number) {
  const notification = {
    title: 'Transferencia programada acreditada!',
    message: 'Se le acredito una transferencia que programó, puede ver el detalle en la seccion "Mis movimientos"',
    user_id: id
  }

  this.postNotification(notification)
}
}
