import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoanService } from '../../service/loan.service';
import Swal from 'sweetalert2';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { InterestRates } from '../../../interestRates/interface/interest-rates.interface';
import { InterestRatesService } from '../../../interestRates/service/interest-rates.service';
import { Loan } from '../../interface/loan';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { Transaction } from '../../../transactions/interface/transaction.interface';

@Component({
  selector: 'app-new-loan',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './new-loan.component.html',
  styleUrl: './new-loan.component.css',
})
export class NewLoanComponent implements OnInit {
  fb = inject(FormBuilder);
  router = inject(Router);
  loanService = inject(LoanService);

  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  interestService = inject(InterestRatesService);
  transactionService = inject(TransactionService);
  rate!: InterestRates;
  calculatedDate: Date | undefined;
  accounts?: Array<Account>;
  account?: Account;

  ngOnInit() {
    this.cargarCuentas();
    this.interestService.getLastRate().subscribe({
      next: (rate) => {
        this.rate = rate;
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }

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
    amount: [0, [Validators.required, Validators.min(1)]],
    account_id: [0, [Validators.required, Validators.min(1)]],
    daysToAdd: [30],
  });

  createLoan() {
    this.loan.amount = this.formulario.get('amount')?.value as number;
    this.loan.account_id = this.formulario.get('account_id')?.value as number;
    this.loan.interest_rate_id = this.rate.id;
    if(this.loan.amount > 1000000){
      Swal.fire({
        title: "Atención",
        text: 'Para prestamos superiores a $1.000.000 dirijase a alguna de nuestras sucursales',
        icon: "error",
        confirmButtonText: 'Aceptar'
      });
    }else{
    this.accountService.getAccountById(this.loan.account_id).subscribe({
      next: (account) => {
        this.account = account;
        const dias = this.formulario.get('daysToAdd')?.value || 0;
        const total =
          this.loan.amount +
          (this.loan.amount * (this.rate.loan_interest_rate * dias)) / 100;

        this.loan.return_amount = total;
        this.loan.expiration_date = this.formatDate(this.updateDate());
        this.loan.request_date = this.formatDate(new Date());

        Swal.fire({
          title: `¿Está seguro que desea solicitar el prestamo?`,
          text:
            'El monto que va a recibir es $' +
            this.loan.amount +
            ', debe devolver $' +
            total +
            ' el dia ' +
            this.formatearFecha(),
          icon: 'warning',
          iconColor: '#0077b6',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, solicitar prestamo',
          cancelButtonText: 'Cancelar',
        }).then((result) => {
          if (result.isConfirmed) {
            this.loanService.createLoan(this.loan as Loan).subscribe({
              next: (response) => {
                this.accountService
                  .updateBalance(this.loan.amount, this.loan.account_id)
                  .subscribe({
                    next: (flag: any) => {
                      if (flag) {
                        console.log('Saldo actualizado en la cuenta de destino');
                        const transaction = {
                          amount: this.loan.amount,
                          source_account_id: 1,
                          destination_account_id: this.loan.account_id,
                          transaction_type: 'loan'
                        }
                        this.transactionService.postTransaction(transaction as Transaction).subscribe({
                          next: () => {
                            console.log('Transacción de préstamo realizada');
                          },
                          error: (e: Error) => {
                            console.log(e.message);
                          },
                        })
                      }
                    },
                    error: (e: Error) => {
                      console.log(e.message);
                    },
                  });

                Swal.fire({
                  title: 'Prestamo solicitado correctamente',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                });
                this.router.navigate(['/list-loan']);
              },
              error: (error: Error) => {
                console.log(error.message);
              },
            });
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener la cuenta', error);
      },
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
