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
    const amount = this.formulario.get('amount')?.value;
    const source_account = this.formulario.get('source_account')?.value;
    const destination_account = this.formulario.get('destination_account')?.value;
  
    const descAmount = -1 * Number(amount);
    const amountUSD = Number(amount) / Number(this.dolar?.venta);
    const account = this.accounts.find(acc => acc.id === Number(source_account));
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
      title: `¿Está seguro que desea comprar U$D` + amountUSD + `?`,
      text: `Se le debitaran $` + amount + ` de la cuenta seleccionada.`,
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
            this.accountService.updateBalance(amountUSD, Number(destination_account)).subscribe({
              next: (response) => {
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
  
    const descAmount = -1 * Number(amount);
    const amountUSD = Number(amount) * Number(this.dolar?.compra);
    const account = this.accounts.find(acc => acc.id === Number(source_account));
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
      text: `Se le acreditaran $` + amountUSD + ` en la cuenta seleccionada.`,
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
            this.accountService.updateBalance(amountUSD, Number(destination_account)).subscribe({
              next: (response) => {
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
  

}
