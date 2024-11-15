import { Component, inject, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanService } from '../../service/loan.service';
import Swal from 'sweetalert2';
import { Account } from '../../../accounts/interface/account.interface';
import { AccountService } from '../../../accounts/services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { Loan } from '../../interface/loan';

@Component({
  selector: 'app-pay-loan',
  standalone: true,
  imports: [NavbarComponent, ReactiveFormsModule],
  templateUrl: './pay-loan.component.html',
  styleUrl: './pay-loan.component.css'
})
export class PayLoanComponent {



  fb = inject(FormBuilder);
  route = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  loanService = inject(LoanService);
  userSessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  accounts?: Array<Account>;
  account?: Account;
  loan : any = {} ;
  
    ngOnInit() {
      this.cargarCuentas();
      this.cargarPrestamo();
    }  
  
    formulario = this.fb.nonNullable.group({
      amount: [0, [Validators.required, Validators.min(1)]],
      account_id: [0, [Validators.required, Validators.min(1)]]
    })

    cargarPrestamo(){
      this.activatedRoute.paramMap.subscribe({
        next: (params) => {
         const id = params.get('id'); 
          console.log("EL ID DE LOAN "+id);
          
          this.loanService.getLoanById(Number(id)).subscribe({
            next: (loan: Loan) => {
              this.loan = loan;
          },
          error: (e: Error) =>{
            console.log(e.message);
          }
        })
        }})
      }
  
      updatePaid() {
        const amount = this.formulario.get('amount')?.value as number;
        const account_id = this.formulario.get('account_id')?.value as number;
        
        const descontar = -1 * amount;
      
        Swal.fire({
          title: `¿Está seguro que desea pagar el préstamo?`,
          text: 'El monto que va a pagar es de $' + amount,
          icon: "warning",
          iconColor: "#0077b6",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, pagar préstamo",
          cancelButtonText: "Cancelar"
        }).then((result) => {
          if (result.isConfirmed) {
            this.accountService.updateBalance(descontar, account_id).subscribe({
              next: (account) => {
                this.loanService.updatePaid(this.loan?.id as number, amount).subscribe({
                  next: (response) => {
                    Swal.fire({
                      title: 'Préstamo pagado correctamente',
                      icon: 'success',
                      confirmButtonText: 'Aceptar'
                    });
                    this.route.navigate(['/list-loan']);
                  },
                  error: (error: Error) => {
                    console.log(error.message);
                  }
                });
              }
            });
          }
        });
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

    formatearFecha(date : string){
      const formattedDate = new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      return formattedDate;
    }
  
    
}
  
  
