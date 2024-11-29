import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoanService } from '../../service/loan.service';
import Swal from 'sweetalert2';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Loan } from '../../interface/loan';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { Transaction } from '../../../transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pay-loan',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './pay-loan.component.html',
  styleUrl: './pay-loan.component.css',
})
export class PayLoanComponent {
  private fb = inject(FormBuilder);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private loanService = inject(LoanService);
  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  accounts?: Array<Account>;
  account?: Account;
  loan: any = {};

  ngOnInit() {
    this.cargarCuentas();
    this.cargarPrestamo();
  }

  formulario = this.fb.nonNullable.group({
    amount: [null, [Validators.required, Validators.min(1)]],
    account_id: [0, [Validators.required, Validators.min(1)]],
  });

  cargarPrestamo() {
    this.activatedRoute.paramMap.subscribe({
      next: (params) => {
        const id = params.get('id');

        this.loanService.getLoanById(Number(id)).subscribe({
          next: (loan: Loan) => {
            this.loan = loan;
          },
          error: (e: Error) => {
            console.log(e.message);
          },
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
          console.log(this.account?.id);

          console.log(account.id);
          if (account.balance > amount) {
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
                              next: ()=>{
                                console.log('saldo actualizado en la cuenta 1 del banco');
                              }, error : (err:Error)=>{
                                console.log(err.message);
                              }
                            })
                            const transaction = {
                              amount: amount,
                              source_account_id: this.loan.account_id,
                              destination_account_id: 1,
                              transaction_type: 'loan'
                            }
                            this.transactionService.postTransaction(transaction as Transaction).subscribe({
                              next: (transactionId) => {
                                console.log(transactionId);
                              },
                              error: (error: Error) => {
                                console.log(error.message);
                              },
                            })
                            this.route.navigate(['/list-loan']);
                          },
                          error: (error: Error) => {
                            console.log(error.message);
                          },
                        });
                    },
                  });
              }
            });
          }else{
            console.log(account.balance);
              Swal.fire({
                text: 'No tiene suficiente dinero en la cuenta.',
                icon: 'error',
                confirmButtonText: 'Aceptar',
                confirmButtonColor: '#00b4d8'
              });
          }
        },
        error: (error: Error) => {
          console.log(error);
        },
      });
    }
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

}
