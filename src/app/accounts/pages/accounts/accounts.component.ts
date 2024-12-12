import Swal from 'sweetalert2';
import { Account } from '@accounts/interface/account.interface';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { Component, inject } from '@angular/core';
import { UserSessionService } from '@auth/services/user-session.service';
import { Router, RouterModule } from '@angular/router';
import { CardAccountComponent } from '@accounts/components/card-account/card-account.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NavbarComponent, CardAccountComponent, RouterModule, CommonModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})

export class AccountsComponent {

  // Dependency injections
  private router = inject(Router);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);

  // Variables
  userId: number = 0;
  accounts: Array<Account> = [];

  ngOnInit(): void {
    // Get the user ID from session
    this.userId = this.userSessionService.getUserId();

    // Fetch accounts associated with the user ID
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      next: (accounts) => {
        // Filter active accounts
        this.accounts = accounts.filter(account => account.closing_date == null);
      },
      error: (error: Error) => console.error('Error fetching accounts:', error)
    });
  }

  // Function to deactivate a bank account
  deactivateAccount(id: number){

    this.accountService.getAccountById(id).subscribe({
      next: (account) =>{
        // Show error if account balance is greater than or equal to $1
        if(account.balance >= 1){
          Swal.fire({
            title: "El saldo de la cuenta a dar de baja debe ser menor a $1.",
            icon: "error"
          });
        }else{
          // Confirm deactivation
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
                error: (err: Error) => console.log(err.message)
              });
            }
          });
        }
      },
      error: (error: Error) => console.log(error.message)
    })
  }
}
