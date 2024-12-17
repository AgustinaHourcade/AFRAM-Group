import Swal from 'sweetalert2';
import { Loan } from '@loans/interface/loan';
import { Account } from '@accounts/interface/account.interface';
import { LoanService } from '@loans/service/loan.service';
import { Transaction } from '@transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { TransactionService } from '@transactions/services/transaction.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-pay-loan',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './pay-loan.component.html',
  styleUrl: './pay-loan.component.css',
})
export class PayLoanComponent implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(Router);
  private loanService = inject(LoanService);
  private activatedRoute = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);
  private transactionService = inject(TransactionService);

  loan: any = {};
  account?: Account;
  accounts?: Account[];

  formulario = this.fb.nonNullable.group({
    amount: [null, [Validators.required, Validators.min(1), Validators.pattern(/^\d*\.?\d{0,2}$/)]],
    account_id: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() {
    this.cargarCuentas();
  }

  cargarPrestamo() {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');
        this.loanService.getLoanById(Number(id)).subscribe({
          next: (loan: Loan) => {
            if (!this.accounts?.some(account => account.id === loan.account_id)) {
              this.route.navigate(['/access-denied']);
            } else {
              this.loan = loan;
            }
          },
          error: () => this.route.navigate(['/not-found'])
        });
      },
    });
  }

  updatePaid() {
    const amount = this.formulario.get('amount')?.value || 0;
    const account_id = this.formulario.get('account_id')?.value as number;

    const descontar = -1 * amount;

    if (amount > this.loan.return_amount - this.loan.paid) {
      Swal.fire({
        text: 'No puede pagar más de lo que adeuda.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8'
      });
    } else {
      this.accountService.getAccountById(Number(account_id)).subscribe({
        next: (account) => {
          if (account.balance >= amount) {
            Swal.fire({
              title: `¿Está seguro que desea pagar el préstamo?`,
              text: 'El monto que va a pagar es de $' + amount + '.',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#00b4d8',
              cancelButtonColor: "#e63946",
              confirmButtonText: 'Sí, pagar préstamo',
              cancelButtonText: 'Cancelar',
            }).then((result) => {
              if (result.isConfirmed) {
                this.accountService.updateBalance(descontar, account_id).subscribe({
                  next: () => {
                    this.loanService.updatePaid(this.loan?.id as number, amount).subscribe({
                      next: () => {
                        Swal.fire({
                          title: 'Préstamo pagado correctamente!',
                          icon: 'success',
                          confirmButtonText: 'Aceptar',
                          confirmButtonColor: '#00b4d8'
                        });
                        this.accountService.updateBalance(amount, 1).subscribe({
                          error: (err: Error) => console.log(err.message)
                        })

                        const transaction = {
                          amount: amount,
                          source_account_id: this.loan.account_id,
                          destination_account_id: 1,
                          transaction_type: 'loan'
                        }
                        this.transactionService.postTransaction(transaction as Transaction).subscribe({
                          error: (error: Error) => console.log(error.message)
                        })
                        this.route.navigate(['/list-loan']);
                      },
                      error: (error: Error) => console.log(error.message)
                    });
                  },
                });
              }
            });
          } else {
            Swal.fire({
              text: 'No tiene suficiente dinero en la cuenta.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#00b4d8'
            });
          }
        },
        error: (error: Error) => console.log(error)
      });
    }
  }

  cargarCuentas() {
    const id = this.userSessionService.getUserId();
    this.accountService.getAccountsByIdentifier(id).subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(account => account.closing_date == null);
        this.cargarPrestamo();
      },
      error: (e: Error) => console.log(e.message)
    });
  }

  validateInteger(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    const cursorPosition = inputElement.selectionStart || 0;

    if (event.key === 'Backspace' || event.key === 'Delete') {
      return;
    }

    if (/[^0-9]/.test(event.key)) {
      event.preventDefault();

      const filteredValue = inputElement.value.replace(/[^0-9]/g, '');
      inputElement.value = filteredValue;

      const adjustment = cursorPosition - (inputElement.value.length - filteredValue.length);
      inputElement.setSelectionRange(adjustment, adjustment);
    }
  }
}
