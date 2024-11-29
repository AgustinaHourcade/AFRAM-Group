import { Component, inject, OnInit } from '@angular/core';
import {
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
import { InterestRatesService } from '../../../interestRates/service/interest-rates.service';
import { InterestRates } from '../../../interestRates/interface/interest-rates.interface';
import Swal from 'sweetalert2';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { Transaction } from '../../../transactions/interface/transaction.interface';

@Component({
  selector: 'app-fixedterm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './fixedterm.component.html',
  styleUrl: './fixedterm.component.css',
})
export class NewFixedtermComponent implements OnInit {
  rate!: InterestRates;
  calculatedDate: Date | undefined;
  accounts?: Array<Account>;
  account?: Account;

  private fb = inject(FormBuilder);
  private fixedTermService = inject(FixedTermService);
  private router = inject(Router);
  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);
  private interestService = inject(InterestRatesService);
  private transactionService = inject(TransactionService);

  ngOnInit() {
    this.cargarCuentas();
    this.interestService.getLastRate().subscribe({
      next: (rate) => {
        this.rate = rate;
      },
      error: (e: Error) => {
        console.log(e.message);
      }
    });
  }

  fixedTerm: FixedTerm = {
    account_id: 0,
    invested_amount: 0,
    start_date: this.formatDate(new Date()),
    expiration_date: this.formatDate(new Date()),
    interest_rate_id: 0,
    interest_earned: 0,
    is_paid: ''
  };

  formulario = this.fb.nonNullable.group({
    account_id: [0, [Validators.required, Validators.min(1)]],
    invested_amount: [null, [Validators.required, Validators.min(1)]],
    daysToAdd: [30],
  });

  createFixedTerm(): void {
    if (this.formulario.invalid) {
      return;
    }


    this.fixedTerm.invested_amount = this.formulario.get('invested_amount')?.value || 0;
    this.fixedTerm.account_id = this.formulario.get('account_id')?.value as number;
    this.fixedTerm.interest_rate_id = this.rate.id;

    this.accountService.getAccountById(this.fixedTerm.account_id).subscribe({
      next: (account) => {
        this.account = account;

        if (this.fixedTerm.invested_amount <= this.account.balance) {
          const dias = this.formulario.get('daysToAdd')?.value || 0;
          const total = this.fixedTerm.invested_amount +
                        this.fixedTerm.invested_amount * (this.rate.fixed_term_interest_rate * dias) / 100;

          this.fixedTerm.interest_earned = total - this.fixedTerm.invested_amount;
          this.fixedTerm.expiration_date = this.formatDate(this.updateDate());
          this.fixedTerm.start_date = this.formatDate(new Date());

          Swal.fire({
            title: `¿Está seguro que desea crear el plazo fijo?`,
            text: 'El monto a recibir el ' + this.formatearFecha() + ' es de $' + total + '.' ,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#00b4d8',
            cancelButtonColor: "#e63946",
            confirmButtonText: "Si, crear plazo fijo",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
              this.fixedTermService.createFixedTerm(this.fixedTerm).subscribe({
                next: (response) => {
                  Swal.fire({
                    title:'Plazo fijo creado correctamente!',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#00b4d8'
                  });
                  const descontar = -1 * this.fixedTerm.invested_amount;

                  this.accountService.updateBalance(descontar, this.fixedTerm.account_id).subscribe({
                    next: (flag: any) => {
                      if (flag) {
                        const transaction = {
                          amount: this.fixedTerm.invested_amount,
                          source_account_id: this.fixedTerm.account_id,
                          destination_account_id: 1,
                          transaction_type: 'fixed term'
                        }
                        this.accountService.updateBalance(this.fixedTerm.invested_amount, 1).subscribe({
                          next: ()=>{
                            console.log('saldo actualizado en la cuenta 1 del banco');
                          }, error : (err:Error)=>{
                            console.log(err.message);
                          }
                        })
                        this.transactionService.postTransaction(transaction as Transaction).subscribe({
                          next: (id: number) => {
                            console.log('Transacción creada correctamente con id:', id);
                          },
                          error: (error: Error) => {
                            console.log(error.message);
                          },
                        })
                      }
                    },
                    error: (e: Error) => {
                      console.log(e.message);
                    },
                  });

                  this.router.navigate(['/fixed-terms']);
                },
                error: (error: Error) => {
                  console.log(error.message);
                },
              });
            }
          });
        } else {
          Swal.fire({
            title: "Saldo insuficiente!",
            icon: "error",
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener la cuenta', error);
      },
    });
  }

  updateDate(): Date {
    const days = parseInt(this.formulario.get('daysToAdd')?.value?.toString() || '0', 10);
    const today = new Date();

    const newDate = new Date(today);
    newDate.setDate(today.getDate() + days);

    this.calculatedDate = newDate;

    return this.calculatedDate;
  }


formatearFecha(){
  const formattedDate = new Date(this.fixedTerm.expiration_date as string).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return formattedDate;
}

  cargarCuentas() {
    const id = this.userSessionService.getUserId();
    this.accountService.getAccountsByIdentifier(id).subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(account => account.closing_date === null);
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
