import Swal from 'sweetalert2';
import { Card } from '@cards/interface/card';
import { User } from '@users/interface/user.interface';
import { Account } from '@accounts/interface/account.interface';
import { FixedTerm } from '@fixedTerms/interface/fixed-term';
import { RouterLink } from '@angular/router';
import { Transaction } from '@transactions/interface/transaction.interface';
import { CardService } from '@cards/service/card.service';
import { UserService } from '@users/services/user.service';
import { CommonModule } from '@angular/common';
import { EmailService } from '@email/service/email.service';
import { AccountService } from '@accounts/services/account.service';
import { DolarComponent } from "@shared/dolar/components/dolar.component";
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { FixedTermService } from '@fixedTerms/service/fixed-term.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { TransactionService } from '@transactions/services/transaction.service';
import { CardAccountComponent } from '@accounts/components/card-account/card-account.component';
import { TransactionComponent } from '@transactions/components/transaction/transaction.component';
import { NotificationsService } from '@notifications/service/notifications.service';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Observable, catchError, firstValueFrom, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NavbarComponent, CardAccountComponent, TransactionComponent, CommonModule, DolarComponent, RouterLink],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})

export class MainPageComponent implements OnInit {

  private cardService = inject(CardService);
  private userService = inject(UserService);
  private emailService = inject(EmailService);
  private accountService = inject(AccountService);
  private changeDetector = inject(ChangeDetectorRef);
  private fixedTermService = inject(FixedTermService);
  private userSessionService = inject(UserSessionService);
  private transactionService = inject(TransactionService);
  private notificationService = inject(NotificationsService);

  user!: User;
  cards: Card[] = [];
  userId: number = 0;
  accounts: Account[] = [];
  pageSize: number = 4;
  fixedTerms: FixedTerm[] = [];
  activeCards: Card[] = [];
  showActions: boolean = false;
  currentPage: number = 1;
  transactions: Transaction[] = [];
  allTransactions: Transaction[] = [];
  selectedAccountId!: number;
  openedTransactionId: number | undefined = undefined;

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    this.getAccounts();
    this.verifyFixedTerms();
    this.getCards();
  }

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

  toggleReceipt(transactionId: number | undefined): void {
    this.openedTransactionId = this.openedTransactionId === transactionId ? undefined : transactionId;
  }

  isReceiptOpen(transactionId: number | undefined): boolean {
    return this.openedTransactionId === transactionId;
  }


  private getAccounts() {
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = [];
        this.transactions = [];
        this.accounts = accounts.filter(account => account.closing_date == null);
        this.verifyTransferProgramming();
      },
      error: (error: Error) => console.error(error.message)
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
      error: (err: Error) => console.log(err.message)
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
         error: (err: Error) => console.log(err.message)
        })
      },
      error: (err: Error) => console.log(err.message)
    });
  }

  private markFixedTermAsPaid(item: FixedTerm, amount: number) {
    this.fixedTermService.setPayFixedTerms(item.id as number).subscribe({
      next: () => this.createFixedTermTransaction(item, amount),
      error: (error: Error) => console.error('Error marking fixed term as paid:', error)
    });
  }

  private createFixedTermTransaction(item: FixedTerm, amount: number) {
    const transaction = {
      amount: amount,
      source_account_id: 1, // Verifica si este ID es correcto
      destination_account_id: item.account_id,
      transaction_type: 'fixed term',
      is_paid: 'yes'
    };

    this.transactionService.postTransaction(transaction as Transaction).subscribe({
      next: () => this.showFixedTermSuccessAlert(),
      error: (error: Error) => console.log('Error posting transaction:', error.message)
    });
  }
  private showFixedTermSuccessAlert() {

    const notification = {
      title: 'Plazo fijo acreditado!',
      message: 'Puede ver el comprobante en la seccion "Mis movimientos"',
      user_id: this.userId
    }

    this.postNotification(notification);
    setTimeout(() => window.location.reload(), 300)
  }

  private postNotification(notification: any) {
    this.notificationService.postNotification(notification).subscribe({
      error: (e: Error) => console.log(e.message)
    })
  }

  private getCards() {
    this.cardService.getCardsById(this.userId).subscribe({
      next: (cards) => {
        this.cards = cards;
        cards.forEach((card) => {
          if (card.is_Active === 'yes') {
            this.activeCards.push(card);
          }
        });
        this.expiredCards();
      },
      error: (error: Error) => console.log(error.message)
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
        console.error(`Error loading transactions for account ${accountId}:`, error);
        return of([]);
      })
    );
  }

  onAccountSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const selectedAccountId = Number(target.value);
      this.selectedAccountId = selectedAccountId;
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
      error: (error: Error) => console.error(`Error loading transactions for account ${this.selectedAccountId}:`, error)
    });
  }

  scrollToBottom() {
    const lastElement = document.querySelector('.transactions-page:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }

  private verifyTransferProgramming() {
    this.accounts.forEach((account) => {
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
              this.accountService.getAccountById(item.source_account_id).subscribe({
                next: (account) => {
                  account = account
                },
                error: (e: Error) =>  console.log(e.message)
              })
              if (account.balance < item.amount) {
                this.deleteTransfer(Number(item.id));
                this.sendNotificationFail(account.user_id);
                this.getAccounts();
                return;
              }
              this.processTransferProgramming(item);
              this.sendEmail(item);
              this.markTransferProgrammingAsPaid(item);
              this.getAccounts();

            }
          });
        },
        error: (err: Error) => console.log(err.message)
      });
    });
  }

  deleteTransfer(id: number) {
    this.transactionService.deleteTransaction(id).subscribe({
      error: (e: Error) => console.log(e.message)
    })
  }

  sendNotificationFail(id: number) {
    const notification = {
      title: 'No pudo realizarse una transferencia programada!',
      message: 'No tiene suficiente saldo, por favor revise su cuenta',
      user_id: id
    }

    this.postNotification(notification)
  }


  private processTransferProgramming(item: Transaction) {
    const amount = Number(item.amount);
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
      error: (err) => console.error('Error procesando la transferencia programada:', err)
    });
  }


  private markTransferProgrammingAsPaid(item: Transaction) {
    this.transactionService.setPayTransferProgramming(Number(item.id)).subscribe({
      next: () => {
        this.sendTransferSourceNotification(item.source_account_id)

        this.sendTransferDestinationNotification(item.destination_account_id)

        this.getAccounts();
      },
      error: (error: Error) => console.error('Error al marcar la transferencia como pagada:', error)
    });
  }

  private sendTransferSourceNotification(id: number) {
    this.accountService.getAccountById(id).subscribe({
      next: (account) => {
        const notification = {
          title: 'Se realizó una transferencia programada!',
          message: 'Se le debitó una transferencia que programó, puede ver el detalle en la sección "Mis movimientos"',
          user_id: account.user_id
        }

        this.postNotification(notification)
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  private sendTransferDestinationNotification(id: number) {
    this.accountService.getAccountById(id).subscribe({
      next: (account) => {
        const notification = {
          title: 'Transferencia acreditada!',
          message: 'Se le acreditó una transferencia, puede ver el detalle en la sección "Mis transferencias"',
          user_id: account.user_id
        }

        this.postNotification(notification)
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  async sendEmail(transaction: Transaction): Promise<void> {
    let destinationAccount !: Account;

    try {
      await this.getUserByAccountId(transaction.destination_account_id);

      this.accountService.getAccountById(transaction.destination_account_id).subscribe({
        next: (account) => destinationAccount = account, 
        error: (e: Error) => console.log(e.message)
      })

      this.accountService.getAccountById(transaction.source_account_id).subscribe({
        next: (account) => {
          this.userService.getUser(account.id).subscribe({
            next: (user) => {
              this.emailService.sendTransferEmail(user.email as string, transaction.amount, account.user_id, destinationAccount.user_id).subscribe({
                  error: (error: Error) => console.log('Error al enviar el correo:', error),
                });
            },
            error: (e: Error) => console.log(e.message)
          })
        }, error: (e: Error) => console.log(e.message)
      })
    } catch (error) {
      console.error('Error en sendEmail:', error);
    }
  }

  async getUserByAccountId(accountId: number): Promise<void> {
    try {
      const account = await firstValueFrom(this.accountService.getAccountById(accountId));
      this.user = await firstValueFrom(this.userService.getUser(account.user_id));
    } catch (error) {
      console.error('Error en getUserByAccountId:', error);
      throw error;
    }
  }

  async expiredCards() {
    const now = Date.now();
    for (const card of this.cards) {
      const expirationDate = new Date(card.expiration_date);
      if (Number(expirationDate) < now && card.is_Active === 'yes') {
        const userDecision = await Swal.fire({
          title: `La tarjeta ${card.card_number} venció el ${expirationDate.toLocaleDateString()}.
          ¿Desea extenderla por 5 años?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#00b4d8',
          cancelButtonColor: "#e63946",
          confirmButtonText: 'Aceptar',
          cancelButtonText: 'Cancelar',
        });
  
        if (userDecision.isConfirmed) {
          try {
            const newCard = {
              card_number: card.card_number,
              expiration_date: this.generarFechaExpiracion(),
              cvv: card.cvv,
              card_type: card.card_type,
              user_id: card.user_id,
              account_id: card.account_id
            };
  
            // Crea una nueva tarjeta
            await this.cardService.createCard(newCard).toPromise();
  
            // Desactiva la tarjeta anterior
            await this.cardService.disableCard(card.card_id).toPromise();
  
            await Swal.fire({
              title: 'Tarjeta extendida!',
              text: `La nueva fecha de expiración es el ${newCard.expiration_date}.`,
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#00b4d8'
            });
          } catch (err: any) {
            Swal.fire({
              title: 'Error',
              text: `No se pudo extender la tarjeta ${card.card_number}.`,
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#e63946',
            });
          }
          this.getCards();
        } else {
          this.cardService.disableCard(card.card_id).toPromise();
          this.getCards();
        }
      }
    }
  }
  
  generarFechaExpiracion(): string {
    const fechaOriginal = new Date();
    fechaOriginal.setFullYear(fechaOriginal.getFullYear() + 5);
    return fechaOriginal.toISOString().split('T')[0];
  }
}
