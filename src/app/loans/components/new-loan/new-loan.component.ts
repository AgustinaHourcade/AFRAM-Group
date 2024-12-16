import Swal from 'sweetalert2';
import { Loan } from '@loans/interface/loan';
import { Router } from '@angular/router';
import { Account } from '@accounts/interface/account.interface';
import { LoanService } from '@loans/service/loan.service';
import { Transaction } from '@transactions/interface/transaction.interface';
import { InterestRates } from '@interestRates/interface/interest-rates.interface';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { TransactionService } from '@transactions/services/transaction.service';
import { InterestRatesService } from '@interestRates/service/interest-rates.service';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-new-loan',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './new-loan.component.html',
  styleUrl: './new-loan.component.css',
})
export class NewLoanComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private loanService = inject(LoanService);
  private accountService = inject(AccountService);
  private interestService = inject(InterestRatesService);
  private userSessionService = inject(UserSessionService);
  private transactionService = inject(TransactionService);

  rate!: InterestRates;
  account?: Account;
  accounts: Account[] = [];
  calculatedDate: Date | undefined;

  loan = {
    account_id: 0,
    amount: 0,
    paid: 0,
    expiration_date: this.formatDate(new Date()),
    request_date: this.formatDate(new Date()),
    interest_rate_id: 0,
    return_amount: 0,
  };

  formulario = this.fb.nonNullable.group({
    amount: [null, [Validators.required, Validators.min(1)]],
    account_id: [0, [Validators.required, Validators.min(1)]],
    daysToAdd: [30],
  });
  ngOnInit() {
    this.cargarCuentas();
    this.interestService.getLastRate().subscribe({
      next: (rate) => this.rate = rate,
      error: (e: Error) => console.log(e.message)
    });
  }

  createLoan() {
    this.loan.amount = this.formulario.get('amount')?.value || 0;
    this.loan.account_id = this.formulario.get('account_id')?.value as number;
    this.loan.interest_rate_id = this.rate.id;
    if(this.loan.amount > 1000000){
      Swal.fire({
        text: 'Para préstamos superiores a $1.000.000 dirijase a alguna de nuestras sucursales.',
        icon: "warning",
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8'
      });
    }else{
    this.accountService.getAccountById(this.loan.account_id).subscribe({
      next: (account) => {
        this.account = account;
        const dias = this.formulario.get('daysToAdd')?.value || 0;
        const total = this.loan.amount + (this.loan.amount * (this.rate.loan_interest_rate * dias)) / 100;

        this.loan.return_amount = total;
        this.loan.expiration_date = this.formatDate(this.updateDate());
        this.loan.request_date = this.formatDate(new Date());

        Swal.fire({
          title: `¿Está seguro que desea solicitar el préstamo?`,
          text: 'El monto que va a recibir es $' + Math.trunc(this.loan.amount) + ', debe devolver $' + Math.trunc(total) + ' el dia ' + this.formatearFecha() + '.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#00b4d8',
          cancelButtonColor: "#e63946",
          confirmButtonText: 'Si, solicitar préstamo',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.loanService.createLoan(this.loan as Loan).subscribe({
              next: () => {
                this.accountService.updateBalance(this.loan.amount, this.loan.account_id).subscribe({
                    next: (flag: any) => {
                      if (flag) {
                        const transaction = {
                          amount: this.loan.amount,
                          source_account_id: 1,
                          destination_account_id: this.loan.account_id,
                          transaction_type: 'loan'
                        }
                        const descontar = -1 * this.loan.amount;

                        this.accountService.updateBalance(descontar, 1).subscribe({
                          error : (err:Error)=> console.log(err.message)
                        })

                        this.transactionService.postTransaction(transaction as Transaction).subscribe({
                          error: (e: Error) => console.log(e.message)
                        })
                      }
                    },
                    error: (e: Error) => console.log(e.message)
                  });

                Swal.fire({
                  title: 'Préstamo solicitado correctamente!',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#00b4d8'
                });
                this.router.navigate(['/list-loan']);
              },
              error: (error: Error) => console.log(error.message)
            });
          }
        });
      },
      error: (error) => console.error('Error al obtener la cuenta', error)
    });
  }
  }

  updateDate(): Date {
    const days = parseInt(
      this.formulario.get('daysToAdd')?.value?.toString() || '0',
      10
    );
    const today = new Date();

    const newDate = new Date(today);
    newDate.setDate(today.getDate() + days);

    this.calculatedDate = newDate;

    return this.calculatedDate;
  }

  formatearFecha() {
    const formattedDate = new Date(
      this.loan.expiration_date
    ).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return formattedDate;
  }

  cargarCuentas() {
    const id = this.userSessionService.getUserId();
    this.accountService.getAccountsByIdentifier(id).subscribe({
      next: (accounts) => this.accounts = accounts.filter(account => account.closing_date === null),
      error: (e: Error) => console.log(e.message)
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  }
}
