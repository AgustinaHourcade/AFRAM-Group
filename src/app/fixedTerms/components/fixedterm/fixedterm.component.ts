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
import { InterestRatesService } from '../../../interestRates/service/interest-rates.service';
import { InterestRates } from '../../../interestRates/interface/interest-rates.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-fixedterm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './fixedterm.component.html',
  styleUrl: './fixedterm.component.css',
})
export class NewFixedtermComponent implements OnInit {
  fb = inject(FormBuilder);
  fixedTermService = inject(FixedTermService);
  router = inject(Router);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  interestService = inject(InterestRatesService);
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
      }
    });
  }

  fixedTerm: FixedTerm = {
    account_id: 0,
    invested_amount: 0,
    start_date: this.formatDate(new Date()),
    expiration_date: this.formatDate(new Date()),
    interest_rate_id: 0,
    interest_earned: 0
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
            text: 'El monto a recibir el ' + this.formatearFecha() + ' es de $' + total,
            icon: "warning",
            iconColor: "#0077b6",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, crear plazo fijo",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
              this.fixedTermService.createFixedTerm(this.fixedTerm).subscribe({
                next: (response) => {
                  Swal.fire({
                    title:'Plazo fijo creado correctamente',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                  });
                  const descontar = -1 * this.fixedTerm.invested_amount;
  
                  this.accountService.updateBalance(descontar, this.fixedTerm.account_id).subscribe({
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
                  console.log(error.message);
                },
              });
            }
          });
        } else {
          Swal.fire({
            title: "Saldo suficiente!",
            icon: "error"
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
  const formattedDate = new Date(this.fixedTerm.expiration_date).toLocaleDateString('es-ES', {
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
