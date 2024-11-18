
import { SafeResourceUrl } from '@angular/platform-browser';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { AccountService } from '../../../accounts/services/account.service';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Account } from '../../../accounts/interface/account.interface';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../../users/interface/user.interface';
import { UserService } from '../../../users/services/user.service';
import { UserSessionService } from '../../../auth/services/user-session.service';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../interface/transaction.interface';
import { EmailService } from '../../../email/service/email.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './transfer-modal.component.html',
  styleUrl: './transfer-modal.component.css',
})
export class TransferModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ account: Account; user: User }>();
  confirmar = false;
  account: any = null;
  flag: boolean = false;
  errorMessage: string = '';
  user!: User;
  accounts!: Array<Account>;
  router = inject(Router);
  userService = inject(UserService);
  sessionService = inject(UserSessionService);
  accountService = inject(AccountService);
  transactionService = inject(TransactionService);
  montoTransferencia: number | null | undefined = 0

  fb = inject(FormBuilder);
  origen!: Account;

  newRecipientForm = this.fb.group({
    searchType: ['alias', Validators.required],
    accountSearch: ['', Validators.required],
  });

  amount = this.fb.group({
    amountToTransfer: [0, [Validators.required, Validators.min(1)]],
    selectedAccountId: ['', [Validators.required]]
  });

  emailService=inject(EmailService);

  onClose() {
    this.close.emit();
  }


  searchAccount() {
    const searchType = this.newRecipientForm.get('searchType')?.value;
    const accountSearchValue =
      this.newRecipientForm.get('accountSearch')?.value;

    if (searchType === 'cbu') {
      this.accountService.getAccountByCbu(accountSearchValue).subscribe({
        next: (id) => {
          this.accountService.getAccountById(id).subscribe({
            next: (account) => {
              this.account = account;
              if (this.account && this.account.user_id) {
                this.userService.getUser(this.account.user_id).subscribe({
                  next: (user) => {
                    this.user = user;
                    this.flag = true;
                  },
                  error: (error: Error) => {
                    console.log('Error al obtener el usuario:', error);
                  },
                });
              }
            },
            error: (error: Error) => {
              console.log('Error al obtener la cuenta por ID:', error);
            },
          });
        },
        error: () => {
          this.errorMessage = 'Cuenta no encontrada.';
          this.account = null;
        },
      });
    } else if (searchType === 'alias') {
      this.accountService.getAccountByAlias(accountSearchValue).subscribe({
        next: (id) => {
          this.accountService.getAccountById(id).subscribe({
            next: (account) => {
              this.account = account;

              if (this.account && this.account.user_id) {
                this.userService.getUser(this.account.user_id).subscribe({
                  next: (user) => {
                    this.user = user;
                    this.flag = true;
                  },
                  error: (error: Error) => {
                    console.log('Error al obtener el usuario:', error);
                  },
                });
              }
            },
            error: (error: Error) => {
              console.log('Error al obtener la cuenta por ID:', error);
            },
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'Cuenta no encontrada',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          this.errorMessage = 'Error al buscar la cuenta.';
          this.account = null;
        },
      });
    }

    this.cargarCuentas();
  }

  cargarCuentas() {
    const id = this.sessionService.getUserId();
    this.accountService.getAccountsByIdentifier(id).subscribe({
      next: (accounts) => {
        this.accounts = accounts;
      },
      error: (e: Error) => {
        console.log(e.message);
      },
    });
  }

  userOrigen!: User;
  
  realizarTransfer() {
    const selectedAccountId = this.amount.get('selectedAccountId')?.value;
    const selectedAccount = this.accounts.find(
      (account) => account.id === Number(selectedAccountId)
    );
    this.montoTransferencia = this.amount.controls['amountToTransfer']?.value;
  
    if (!selectedAccount) {
      Swal.fire({
        title: 'Error',
        text: 'Seleccione una cuenta de origen.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      return;
    }
  
    if (this.montoTransferencia! > selectedAccount.balance) {
      Swal.fire({
        title: 'Error',
        text: 'Saldo insuficiente',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      this.errorMessage = 'No tienes suficiente saldo para realizar la transferencia.';
      return;
    }
  
    Swal.fire({
      title: 'Confirmar transferencia',
      text: `¿Está seguro de transferir $${this.montoTransferencia} desde la cuenta ${selectedAccount.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, transferir',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const transaction = {
          amount: this.montoTransferencia,
          source_account_id: selectedAccount.id,
          destination_account_id: this.account?.id,
        };
  
        this.transactionService.postTransaction(transaction as Transaction).subscribe({
          next: () => {
            Swal.fire({
              title: 'Éxito',
              text: '¡Transferencia realizada!',
              icon: 'success',
              confirmButtonText: 'Aceptar',
            });
  
            if (this.userOrigen.email) {
              this.emailService
                .sendTransferEmail(
                  this.userOrigen.email,
                  this.montoTransferencia!,
                  selectedAccount.id,
                  this.account?.id
                )
                .subscribe({
                  next: () => console.log('Correo de notificación enviado'),
                  error: (error: Error) => console.log('Error al enviar el correo:', error),
                });
            }
          },
          error: (e: Error) => console.log('Error al realizar la transacción:', e.message),
        });
  
        const newAmount = -1 * (this.montoTransferencia as number);
        this.accountService.updateBalance(newAmount, selectedAccount.id).subscribe({
          next: (flag) => {
            if (flag) console.log('Saldo actualizado en la cuenta de origen');
          },
          error: (e: Error) => console.log(e.message),
        });
  
        this.accountService.updateBalance(this.montoTransferencia as number, this.account?.id).subscribe({
          next: (flag) => {
            if (flag) console.log('Saldo actualizado en la cuenta de destino');
          },
          error: (e: Error) => console.log(e.message),
        });
  
        this.router.navigate(['my-transactions']);
      }
    });
  }
  
  
  
}
