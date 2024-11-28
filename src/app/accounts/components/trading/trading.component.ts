import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from "../../../shared/navbar/navbar.component";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { DolarService } from '../../../shared/dolar/service/dolar.service';
import { AccountService } from '../../services/account.service';
import { Account } from '../../interface/account.interface';
import { Cotizacion } from '../../../shared/dolar/interface/cotizacion';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { DolarComponent } from "../../../shared/dolar/components/dolar.component";
import { TransactionService } from '../../../transactions/services/transaction.service';
import { Transaction } from '../../../transactions/interface/transaction.interface';
import { EmailService } from '../../../email/service/email.service';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule, CommonModule, DolarComponent],
  templateUrl: './trading.component.html',
  styleUrl: './trading.component.css'
})

export class TradingComponent implements OnInit {

  private fb = inject(FormBuilder);
  private sessionService = inject(UserSessionService);
  private dolarService = inject(DolarService);
  private accountService = inject(AccountService); 
  private transactionService = inject(TransactionService);
  private emailService = inject(EmailService);

  trading: string = '';
  accounts: Array<Account> = [];
  dolar ?: Cotizacion;
  

  ngOnInit(): void {
    const id = this.sessionService.getUserId()
    this.accountService.getAccountsByIdentifier(id).subscribe({
      next: (accounts) => {
        this.accounts = accounts
      },
      error: (e: Error)=>{
        console.log(e.message);
      }
    })
    this.dolarService.getDolarOficial().subscribe({
      next: (cotizacion) => {
        this.dolar = cotizacion
        },
        error: (e: Error)=>{
          console.log(e.message)
            }
    })
  }

calculatedValueUSD: number = 0; 
calculatedValueARS: number = 0; 

updateCalculatedUSD(amount: string | undefined) {
  const amountNum = parseFloat(amount as string);
  if (!isNaN(amountNum) && this.dolar?.venta) {
    this.calculatedValueUSD = amountNum / Number(this.dolar.venta);
  } else {
    this.calculatedValueUSD = 0; 
  }
}

updateCalculatedARS(amount: string | undefined) {
  const amountNum = parseFloat(amount as string);
  if (!isNaN(amountNum) && this.dolar?.compra) {
    this.calculatedValueARS = amountNum * Number(this.dolar.compra);
  } else {
    this.calculatedValueARS = 0; 
  }
}

  formulario = this.fb.nonNullable.group({
    'amount': ['', Validators.required],
    'source_account': ['', Validators.required],
    'destination_account': ['', Validators.required]
  })

  buyUSD() {
    const source_account = this.formulario.get('source_account')?.value;
    const destination_account = this.formulario.get('destination_account')?.value;
    
    const account = this.accounts.find(acc => acc.id === Number(source_account));
    
    const transaction = {
      amount: this.formulario.get('amount')?.value,
      source_account_id: source_account,
      destination_account_id: 1,
      transaction_type: 'exchange'
    }
    
    const transactionUSD = {
      amount: Number(transaction.amount) / Number(this.dolar?.venta),
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
      this.formulario.reset();
      return;
    }
  
    Swal.fire({
      title: `¿Está seguro que desea comprar U$D` + transactionUSD.amount + `?`,
      text: `Se le debitaran $` + transaction.amount + ` de la cuenta seleccionada.`,
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: "Si, comprar",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {

        this.accountService.updateBalance(descAmount, Number(source_account)).subscribe({
          next: (response) => {
            this.accountService.updateBalance(transactionUSD.amount, Number(destination_account)).subscribe({
              next: (response) => {
                this.postTransaction(transaction);
                this.postTransaction(transactionUSD);
                Swal.fire({
                  text: 'Operacion realizada correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#00b4d8',
                });
                this.trading = '';
              },
              error: (e: Error) => {
                console.log(e.message);
              }
            });
          },
          error: (e: Error) => {
            console.log(e.message);
          }
        });
      }
    });
    this.formulario.reset();
  }
  
  sellUSD() {
    const amount = this.formulario.get('amount')?.value;
    const source_account = this.formulario.get('source_account')?.value;
    const destination_account = this.formulario.get('destination_account')?.value;
  
    const account = this.accounts.find(acc => acc.id === Number(source_account));
    
    const transactionUSD = {
      amount: this.formulario.get('amount')?.value,
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
      this.formulario.reset();
      return;
    }
  
    Swal.fire({
      title: `¿Está seguro que desea vender U$D` + amount + `?`,
      text: `Se le acreditaran $` + transaction.amount + ` en la cuenta seleccionada.`,
      icon: "success",
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: "Si, vender",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {

        this.accountService.updateBalance(descAmount, Number(source_account)).subscribe({
          next: (response) => {
            this.accountService.updateBalance(transaction.amount, Number(destination_account)).subscribe({
              next: (response) => {
                this.postTransaction(transaction);
                this.postTransaction(transactionUSD);
                Swal.fire({
                  text: 'Operacion realizada correctamente.',
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  confirmButtonColor: '#00b4d8',
                });
                this.trading = '';
              },
              error: (e: Error) => {
                console.log(e.message);
              }
            });
          },
          error: (e: Error) => {
            console.log(e.message);
          }
        });
      }
    });
    this.formulario.reset();
  }
  


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

