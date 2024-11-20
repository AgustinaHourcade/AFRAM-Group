import { Component, inject, OnInit } from '@angular/core';
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
import { Observable, catchError, of } from 'rxjs';
import { Card } from '../../cards/interface/card';
import { CardService } from '../../cards/service/card.service';
import { DolarComponent } from "../../shared/dolar/components/dolar.component";
import { FixedTermService } from '../../fixedTerms/service/fixed-term.service';
import { FixedTerm } from '../../fixedTerms/interface/fixed-term';
import Swal from 'sweetalert2';
import { MyFixedTermComponent } from '../../fixedTerms/components/my-fixed-term/my-fixed-term.component';
import { MyLoanComponent } from '../../loans/components/my-loan/my-loan.component';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [NavbarComponent,
            CardAccountComponent,
            TransactionComponent,
            CommonModule, 
            DolarComponent,
            MyFixedTermComponent,
            MyLoanComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css',
})

export class MainPageComponent implements OnInit {
  accounts: Account[] = [];
  transactions: Array<Transaction> = [];
  cards: Array<Card> = [];
  fixedTerms: Array<FixedTerm> = [];
  userId: number = 0;
  showActions = false;

  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  transactionService = inject(TransactionService);
  cardService = inject(CardService);
  fixedTermService = inject(FixedTermService);
  pageSize = 4 ;
  currentPage = 1;


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
  
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        // for (let a of accounts) {
        //   this.loadTransactions(a.id).subscribe({
        //     next: (transactions: Transaction[]) => {
        //       this.transactions.push(...transactions);
        //     },
        //     error: (error: Error) => {
        //       console.error(`Error loading transactions for account ${a.id}:`, error);
        //     },
        //   });
        // }
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  
    this.cardService.getCardsById(this.userId).subscribe({
      next: (cards) => {
        this.cards = cards;
      },
      error: (error: Error) => {
        console.log(error.message);
      },
    });
  
    this.fixedTermService.getFixedTerms().subscribe({
      next: (fixedTerms) => {
        this.fixedTerms = fixedTerms;
        for (let item of fixedTerms) {
          const cant = Number(item.invested_amount) + Number(item.interest_earned);
          if (item.is_paid === 'no') {
            if (this.compareDateWithNow(item.expiration_date)) {
              this.accountService.updateBalance(cant, item.account_id).subscribe({
                next: (flag) => {
                  if (flag) {
                    this.fixedTermService.setPayFixedTerms(item.id as number).subscribe({
                      next: () => {
                        const transaction = {
                          amount: cant,
                          source_account_id: 1,
                          destination_account_id: item.account_id,
                          transaction_type: 'fixed term'
                        }
                        this.transactionService.postTransaction(transaction as Transaction).subscribe({
                          next: () => {
                            Swal.fire({
                              title: 'Se le han acreditado plazos fijos pendientes!',
                              text: `Puede ver el detalle en "mis plazos fijos"`,
                              icon: 'success',
                              confirmButtonText: 'Aceptar',
                            });
                          },
                          error: (error: Error) => {
                                console.log(error.message);
                          }
                          })
                      },
                      error: (error: Error) => {
                        console.error('Error fetching accounts:', error);
                      },
                    });
                  }
                },
                error: (err: Error) => {
                  console.log(err.message);
                },
              });
            }
          }
        }
      },
      error: (err: Error) => {
        console.log(err.message);
      },
    });

    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        for (const account of this.accounts) {
        this.loadTransactions(account.id).subscribe({
          next: (transactions) => {
            this.transactions.push(...transactions);
          },
          error: (err:Error) =>{
            console.log(err.message);
          }
        })
      }
      },
      error: (error: Error) => {
        console.error(error.message);
      },
    });
  }
  
  
  
  private loadTransactions(accountId: number): Observable<Transaction[]> {
    return this.transactionService.getTransactionsByAccountId(accountId).pipe(
      catchError((error: Error) => {
        console.error (`Error loading transactions for account ${accountId}:`, error );
        return of([]);
      })
    );
  }

  toggleActions(div: HTMLDivElement) {
    div.style.display = this.showActions ? 'flex' : 'none';
    this.showActions = !this.showActions;
  }

  compareDateWithNow(dateString: string): boolean {
    const dateFromDatabase = new Date(dateString);
    const currentDate = new Date();
  
    // Ignorar la hora y comparar solo fechas
    const isBeforeOrEqual = 
      dateFromDatabase.getFullYear() < currentDate.getFullYear() ||
      (dateFromDatabase.getFullYear() === currentDate.getFullYear() &&
        (dateFromDatabase.getMonth() < currentDate.getMonth() ||
          (dateFromDatabase.getMonth() === currentDate.getMonth() &&
            dateFromDatabase.getDate() <= currentDate.getDate())));
  
    return isBeforeOrEqual;
  }

}
