import Swal from 'sweetalert2';
import { Loan } from '@loans/interface/loan';
import { Account } from '@accounts/interface/account.interface';
import { FixedTerm } from '@fixedTerms/interface/fixed-term';
import { LoanService } from '@loans/service/loan.service';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { FixedTermService } from '@fixedTerms/service/fixed-term.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { Router, RouterModule } from '@angular/router';
import { CardAccountComponent } from '@accounts/components/card-account/card-account.component';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [NavbarComponent, CardAccountComponent, RouterModule, CommonModule],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css'
})

export class AccountsComponent implements OnInit {

  // Dependency injections
  private router = inject(Router);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);
  private fixedTermService = inject(FixedTermService);
  private loanService = inject(LoanService);

  // Variables
  userId: number = 0;
  accounts: Account[] = [];
  fixedTerms: FixedTerm[] = [];
  loans: Loan[] = [];

  ngOnInit(): void {
    // Get the user ID from session
    this.userId = this.userSessionService.getUserId();

    // Fetch accounts associated with the user ID
    this.accountService.getAccountsByIdentifier(this.userId).subscribe({
      // Filter active accounts
      next: (accounts) => this.accounts = accounts.filter(account => account.closing_date == null),
      error: (error: Error) => console.error('Error fetching accounts:', error)
    });
  }

  // Function to deactivate a bank account
async deactivateAccount(id: number) {
  this.fixedTerms = [];
  this.loans = [];
  try {
    // Load fixed terms and loans, ensuring they are fully loaded before validation
    await Promise.all([this.loadFixedTerms(id), this.loadLoans(id)]);

    // Validate if the account can be deactivated
    const flag = await this.validate();

    if (!flag) {
      Swal.fire({
        title: "No puede cerrar esta cuenta",
        text: "Esta cuenta posee algún préstamo o plazo fijo pendiente.",
        icon: "error",
      });
      return;
    }

    // Fetch the account details
    const account = await this.accountService.getAccountById(id).toPromise();

    // Check account balance
    if (Number (account?.balance) >= 1) {
      Swal.fire({
        title: "El saldo de la cuenta a dar de baja debe ser menor a $1.",
        icon: "error",
      });
      return;
    }

    // Confirm deactivation
    const result = await Swal.fire({
      title: `¿Está seguro que desea dar de baja la cuenta?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#00b4d8",
      cancelButtonColor: "#e63946",
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      const deactivateFlag = await this.accountService.deactivateAccount(id).toPromise();
      if (deactivateFlag) {
        Swal.fire({
          title: "Cuenta suspendida correctamente!",
          icon: "success",
        });
        this.router.navigate(["/main"]);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

// Load fixed terms
loadFixedTerms(id: number): Promise<void> {
  return this.fixedTermService.getFixedTermsByAccountId(id)
    .toPromise()
    .then((fixedTerms) => {
      this.fixedTerms = fixedTerms as FixedTerm[];
    })
    .catch((err) => console.error(err));
}

// Load loans
loadLoans(id: number): Promise<void> {
  return this.loanService.getLoanByAccountId(id)
    .toPromise()
    .then((loans) => {
      this.loans = loans as Loan[];
    })
    .catch((err) => console.error(err));
}

// Validation function
async validate(): Promise<boolean> {
  const invalidLoan = this.loans.some((loan) => loan.paid !== loan.return_amount);
  const invalidFixedTerm = this.fixedTerms.some((fixedTerm) => fixedTerm.is_paid === "no");

  return !(invalidLoan || invalidFixedTerm);
}


}
