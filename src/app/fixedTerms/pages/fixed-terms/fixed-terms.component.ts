import { Component, inject, OnInit } from '@angular/core';
import { FixedTerm } from '../../interface/fixed-term';
import { FixedTermService } from '../../service/fixed-term.service';
import { Router } from '@angular/router';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { catchError, Observable, of } from 'rxjs';

@Component({
  selector: 'app-fixed-terms',
  standalone: true,
  imports: [],
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

    this.accountService.getAccountsByIdentifier(Number(this.userId)).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        for (let account of this.accounts) {
          this.loadFixedTerms(account.id).subscribe({
            next: (fixedTerms: FixedTerm[]) => {
              this.fixedTerms.push(...fixedTerms);
            },
            error: (error: Error) => {
              console.error(
                `Error loading transactions for account ${account.id}:`,
                error
              );
            },
          });
        }
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
