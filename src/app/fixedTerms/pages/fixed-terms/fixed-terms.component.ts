import { Component, inject, OnInit } from '@angular/core';
import { FixedTerm } from '../../interface/fixed-term';
import { FixedTermService } from '../../service/fixed-term.service';
import { Router } from '@angular/router';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { catchError, Observable, of } from 'rxjs';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-fixed-terms',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './fixed-terms.component.html',
  styleUrl: './fixed-terms.component.css',
})
export class FixedTermsComponent implements OnInit {
  fixedTerms: Array<FixedTerm> = [];
  accounts: Array<Account> = [];
  userId: number = 0;

  fixedTermService = inject(FixedTermService);
  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  
  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    this.loadAccounts();
  }
  
  loadAccounts(){
    this.accountService.getAccountsByIdentifier(Number(this.userId)).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        for (let account of this.accounts) {
          if(!account.closing_date){

            this.loadFixedTerms(account.id).subscribe({
              next: (fixedTerms: FixedTerm[]) => {
                this.fixedTerms.push(...fixedTerms);
              },
              error: (error: Error) => {
                console.error(`Error loading transactions for account ${account.id}:`,error);
              },
            });
          }
        }
        this.router.navigate(['/fixed-terms']);
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }




  private loadFixedTerms(accountId: number): Observable<FixedTerm[]> {
    return this.fixedTermService.getFixedTermsByAccountId(accountId).pipe(
      catchError((error: Error) => {
        console.error(`Error loading fixed terms`, error);
        return of([]);
      })
    );
  }

  formatearFecha(date : string){
    const formattedDate = new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formattedDate;
  }

}
