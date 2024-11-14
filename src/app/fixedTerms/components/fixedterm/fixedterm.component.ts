import { Component, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { FixedTerm } from '../../interface/fixed-term';
import { FixedTermService } from '../../service/fixed-term.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { AccountService } from '../../../accounts/services/account.service';
import { Account } from '../../../accounts/interface/account.interface';
import { FixedTermsComponent } from '../../pages/fixed-terms/fixed-terms.component';

@Component({
  selector: 'app-fixedterm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FixedTermsComponent],
  templateUrl: './fixedterm.component.html',
  styleUrl: './fixedterm.component.css',
})
export class FixedtermComponent implements OnInit {
  fb = inject(FormBuilder);
  fixedTermService = inject(FixedTermService);
  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);

  fixedTerm: FixedTerm = {
    account_id: 0,
    invested_amount: 0,
    start_date: this.formatDate(new Date()),
    expiration_date: this.formatDate(new Date()),
    interest_rate_id: 1,
  };

  calculatedDate: string | null = null;
  accounts!: Array<Account>;

  account: Account = {
    id: 0,
    balance: 0,
    opening_date: new Date(),
    closing_Date: new Date(), 
    cbu: '',
    alias: '',
    account_type: 'Savings',  
    overdraft_limit: 0,
    user_id: 0
  };

  formulario = this.fb.nonNullable.group({
    account_id: [0, [Validators.required, Validators.min(1)]],
    invested_amount: [0, [Validators.required, Validators.min(1)]],
    daysToAdd: [30],
  });

  createFixedTerm(): void {
    if (this.formulario.invalid) {
      return;
    }
  
    this.fixedTerm.invested_amount = this.formulario.get('invested_amount')?.value as number;
    this.fixedTerm.account_id = this.formulario.get('account_id')?.value as number;
    this.fixedTerm.interest_rate_id = 1;
    this.fixedTerm.expiration_date = this.formatDate(this.updateDate());
    this.fixedTerm.start_date = this.formatDate(new Date());
  
    this.accountService.getAccountById(this.fixedTerm.account_id).subscribe({
      next: (account) => {
        this.account = account;
        console.log("cuenta 1 " + this.account);
        console.log("cuenta 1 id " + this.account.id); 
  
        if (this.fixedTerm.invested_amount < this.account.balance) {
          this.fixedTermService.createFixedTerm(this.fixedTerm).subscribe({
            next: (response) => {
              console.log('Plazo fijo creado', response);
  
              this.accountService.updateBalance(this.fixedTerm.invested_amount, this.fixedTerm.account_id).subscribe({
                next: (flag: any) => {
                  if (flag) {
                    console.log('Saldo actualizado en la cuenta de destino');
                  }
                },
                error: (e: Error) => {
                  console.log(e.message);
                },
              });
  
              this.router.navigate(['/fixed-terms']);
            },
            error: (error: Error) => {
              console.error('Error al crear plazo fijo', error);
            },
          });
        } else {
          console.log('Saldo insuficiente');
        }
      },
      error: (error) => {
        console.error('Error al obtener la cuenta', error);
      },
    });
  }
  

  updateDate(): Date {
    const days = this.formulario.get('daysToAdd')?.value || 0;
    const today = new Date();
    const resultDate = new Date(today.setDate(today.getDate() + days));
    this.calculatedDate = resultDate.toISOString().split('T')[0];
    return resultDate;
  }

  ngOnInit() {
    this.updateDate();
    this.cargarCuentas();
  }

  cargarCuentas() {
    const id = this.userSessionService.getUserId();
    this.accountService.getAccountsByIdentifier(id).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  }
}
