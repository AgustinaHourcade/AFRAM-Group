import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { AccountService } from '../../services/account.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { CardAccountComponent } from '../../components/card-account/card-account.component';
import { Account } from '../../interface/account.interface';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NavbarComponent, CardAccountComponent, RouterModule, CommonModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})
export class AccountsComponent {
  accounts: Array<Account> = [];
  userId: number = 0;

  private router = inject(Router);
  private userSessionService = inject(UserSessionService);
  private accountService = inject(AccountService);

  ngOnInit(): void {
    this.userId = this.userSessionService.getUserId();
    
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      }
    });

  }

  darBaja(id: number ){

    this.accountService.getAccountById(id).subscribe({
      next: (account) =>{
        if(account.balance > 1){
          Swal.fire({
            title: "El saldo de la cuenta a dar de baja debe ser 0.",
            icon: "error"
          });
        }else{
          Swal.fire({
            title: `¿Está seguro que desea dar de baja la cuenta?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#00b4d8',
            cancelButtonColor: "#e63946",
            confirmButtonText: "Si, dar de baja",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
              this.accountService.deactivateAccount(id).subscribe({
                next: (flag) => {
                  if(flag){
                    Swal.fire({
                      title: "Cuenta suspendida correctamente!",
                      icon: "success"
                    });
                  }
                  this.router.navigate(['/main']);
                },
                error: (err: Error) => {
                  console.log(err.message);
                }
              });
            }
          });
        }
        
      },
      error: (error: Error) =>{
        console.log(error.message);
      }
    })
  }
}
