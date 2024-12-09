import { Component, inject, OnInit } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FixedTerm } from '@fixedTerms/interface/fixed-term';
import { Account } from '@accounts/interface/account.interface';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { FixedTermService } from '@fixedTerms/service/fixed-term.service';

@Component({
  selector: 'app-fixed-terms',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './fixed-terms.component.html',
  styleUrl: './fixed-terms.component.css',
})
export class FixedTermsComponent implements OnInit {

  userId: number = 0;
  accounts: Array<Account> = [];
  fixedTerms: Array<FixedTerm> = [];
  expiredFixedTerms: Array<FixedTerm> = [];

  private router = inject(Router);
  private accountService = inject(AccountService);
  private fixedTermService = inject(FixedTermService);
  private userSessionService = inject(UserSessionService);

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    this.loadAccounts();
  }

  loadAccounts(){
    this.accountService.getAccountsByIdentifier(Number(this.userId)).subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(account => account.closing_date == null);
        for (let account of this.accounts) {
          if(!account.closing_date){

            this.loadFixedTerms(account.id).subscribe({
              next: (fixedTerms: FixedTerm[]) => {
                const unpaid = fixedTerms.filter(term => term.is_paid === 'no');
                const paid = fixedTerms.filter(term => term.is_paid === 'yes');

                this.fixedTerms.push(...unpaid);
                this.expiredFixedTerms.push(...paid);
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
}
