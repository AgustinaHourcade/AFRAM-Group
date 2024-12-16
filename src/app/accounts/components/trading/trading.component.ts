import Swal from 'sweetalert2';
import { Account } from '@accounts/interface/account.interface';
import { Cotizacion } from '@shared/dolar/interface/cotizacion';
import { Transaction } from '@transactions/interface/transaction.interface';
import { CommonModule } from '@angular/common';
import { DolarService } from '@shared/dolar/service/dolar.service';
import { NavbarComponent } from "@shared/navbar/navbar.component";
import { AccountService } from '@accounts/services/account.service';
import { DolarComponent } from "@shared/dolar/components/dolar.component";
import { TransactionService } from '@transactions/services/transaction.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule, DolarComponent],
  templateUrl: './trading.component.html',
  styleUrl: './trading.component.css'
})
export class TradingComponent implements OnInit {

  // Depencency injections
  private fb = inject(FormBuilder);
  private dolarService = inject(DolarService);
  private sessionService = inject(UserSessionService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  // Variables
  id: number = this.sessionService.getUserId();
  dolar?: Cotizacion;
  trading : string = '';
  accounts: Account[] = [];
  accountsUSD: Account[] = [];
  calculatedValueARSbuy = 0;
  calculatedValueARSsell = 0;

  // Reactive form for trading operations
  form = this.fb.nonNullable.group({
    'amount': ['', [Validators.required, Validators.max(10000), Validators.min(1)]],
    'source_account': ['', Validators.required],
    'destination_account': ['', Validators.required]
  })
  
  // Functions
  ngOnInit(): void {
    this.getAccounts()
  
    this.dolarService.getDolarOficial().subscribe({
      next: (cotizacion) => this.dolar = cotizacion,
      error: (e: Error) => console.log(e.message)
    })
  }
  // Fetch accounts from the service
  getAccounts(){
    this.accountService.getAccountsByIdentifier(this.id).subscribe({
      next: (accounts) => {
        this.accounts = accounts.filter(account => account.closing_date == null);
        this.accountsUSD = this.accounts.filter(account => account.currency == 'usd');
      },
      error: (e: Error) => console.log(e.message)
    })
  }

  // Update calculated ARS value for selling
  updateCalculatedARSsell(amount: string | undefined) {
    const amountNum = parseFloat(amount as string);
    if (!isNaN(amountNum) && this.dolar?.venta) {
      this.calculatedValueARSsell = amountNum * Number(this.dolar.compra);
    } else {
      this.calculatedValueARSsell = 0;
    }
  }

  // Update calculated ARS value for buying
  updateCalculatedARSbuy(amount: string | undefined) {
    const amountNum = parseFloat(amount as string);
    if (!isNaN(amountNum) && this.dolar?.compra) {
      this.calculatedValueARSbuy = amountNum * Number(this.dolar.venta);
    } else {
      this.calculatedValueARSbuy = 0;
    }
  }

  // Reset form and calculated values
  resetValues(){
    this.calculatedValueARSsell = 0;
    this.calculatedValueARSbuy = 0;
    setTimeout(() => this.form.reset(), 150);
  }

  // Execute buy USD operation
  buyUSD() {
    const source_account = this.form.get('source_account')?.value;
    const destination_account = this.form.get('destination_account')?.value;

    const account = this.accounts.find(acc => acc.id === Number(source_account));

    const transaction = {
      amount: Number(this.form.get('amount')?.value) * Number(this.dolar?.venta),
      source_account_id: source_account,
      destination_account_id: 1,
      transaction_type: 'exchange'
    }

    const transactionUSD = {
      amount: Number(this.form.get('amount')?.value),
      source_account_id: 2,
      destination_account_id: destination_account,
      transaction_type: 'exchange'
    }

    const descAmount = -1 * Number(transaction.amount);

    if(Number(transaction.amount)> Number(account?.balance)){
      Swal.fire({
        text: 'No tiene suficiente saldo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8',
      });
      this.form.reset();
      return;
    }

    Swal.fire({
      title: `¿Está seguro que desea comprar U$D ` + transactionUSD.amount + `?`,
      text: `Se le debitarán $` + transaction.amount + ` de la cuenta seleccionada.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: "Si, comprar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountService.updateBalance(descAmount, Number(source_account)).subscribe({
          next: () => {
            this.accountService.updateBalance(transactionUSD.amount, Number(destination_account)).subscribe({
              next: () => {
                this.postTransaction(transaction);
                this.postTransaction(transactionUSD);
                Swal.fire({
                  text: 'Operacion realizada correctamente!',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#00b4d8',
                });

                this.resetValues();
                this.trading = '';

                this.accountService.updateBalance(Number(transaction.amount), 1).subscribe({
                  error : (err:Error) => console.log(err.message)
                })

                const descontarUSD = -1 * transactionUSD.amount;

                this.accountService.updateBalance(descontarUSD, 2).subscribe({
                  error : (e: Error) => console.log(e.message)
                })
              },
              error: (e: Error) => console.log(e.message)
            });
          },
          error: (e: Error) => console.log(e.message)
        });
      }
    });
    setTimeout(() => {
      this.getAccounts();
    }, 2000);
  }

  // Execute sell USD operation
  sellUSD() {
    const amount = this.form.get('amount')?.value;
    const source_account = this.form.get('source_account')?.value;
    const destination_account = this.form.get('destination_account')?.value;

    const account = this.accounts.find(acc => acc.id === Number(source_account));

    const transactionUSD = {
      amount: this.form.get('amount')?.value,
      source_account_id: source_account,
      destination_account_id: 2,
      transaction_type: 'exchange'
    }

    const transaction = {
      amount: Number(transactionUSD.amount) * Number(this.dolar?.compra),
      source_account_id: 1,
      destination_account_id: destination_account,
      transaction_type: 'exchange'
    }

    const descAmount = -1 * Number(transactionUSD.amount);

    if(Number(amount)> Number(account?.balance)){
      Swal.fire({
        text: 'No tiene suficiente saldo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8',
      });
      return;
    }

    Swal.fire({
      title: `¿Está seguro que desea vender U$D ` + amount + `?`,
      text: `Se le acreditarán $` + transaction.amount + ` en la cuenta seleccionada.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: "Si, vender",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountService.updateBalance(descAmount, Number(source_account)).subscribe({
          next: () => {
            this.accountService.updateBalance(transaction.amount, Number(destination_account)).subscribe({
              next: () => {
                this.postTransaction(transaction);
                this.postTransaction(transactionUSD);
                Swal.fire({
                  text: 'Operacion realizada correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#00b4d8',
                });

                this.resetValues();
                this.trading = '';

                this.accountService.updateBalance(Number(transactionUSD.amount), 2).subscribe({
                  error : (err:Error) => console.log(err.message)
                })
                const descontarARS = -1 * transaction.amount;
                
                this.accountService.updateBalance(descontarARS, 1).subscribe({
                  error : (e: Error)=> console.log(e.message)
                })
              },
              error: (e: Error) => console.log(e.message)
            });
          },
          error: (e: Error) => console.log(e.message)
        });
      }
    });
    setTimeout(() => {
      this.getAccounts();
    }, 2000);
  }

  // Post transaction
  postTransaction(transaction: any) {
  this.transactionService.postTransaction(transaction as Transaction).subscribe({
    next: () => {
      Swal.fire({
        text: '¡Transferencia realizada!',
        icon: 'success',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8'
      });
    },
    error: (e: Error) => console.log('Error al realizar la transacción:', e.message),
  });
}

}

