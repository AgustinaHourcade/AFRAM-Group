import Swal from 'sweetalert2';
import { User } from '@users/interface/user.interface';
import { Router} from '@angular/router';
import { Account } from '@accounts/interface/account.interface';
import { UserService } from '@users/services/user.service';
import { Transaction } from '@transactions/interface/transaction.interface';
import { EmailService } from '@email/service/email.service';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { TransactionService } from '@transactions/services/transaction.service';
import { NotificationsService } from '@notifications/service/notifications.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, EventEmitter, inject, Output, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './transfer-modal.component.html',
  styleUrl: './transfer-modal.component.css',
})
export class TransferModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private userService = inject(UserService);
  private emailService = inject(EmailService);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);
  private transactionService = inject(TransactionService);
  private montoTransferencia: number | null | undefined = 0
  private notificationService = inject(NotificationsService);

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ account: Account; user: User }>();
  @Input() data: any;
  @Output() transactionConfirmed = new EventEmitter<Transaction>();

  id !: number;
  flag: boolean = false;
  user !: User;
  origen!: Account;
  account: any = null;
  accounts !: Account[];
  confirmar: boolean = false;
  userDestino !: User;
  errorMessage: string = '';
  transactionData !: Transaction;

  userId: number = this.userSessionService.getUserId();

  newRecipientForm = this.fb.group({
    searchType: ['alias', Validators.required],
    accountSearch: ['', Validators.required],
  });

  amount = this.fb.group({
    amountToTransfer: [1, [Validators.required, Validators.min(1)]],
    selectedAccountId: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.id = this.userSessionService.getUserId();
    this.userService.getUser(this.id).subscribe({
      next: (user) =>  this.user = user,
      error: (e : Error) => console.log(e.message)
    })

    this.cargarCuentas();
  }

  onClose() {
    this.close.emit();
  }

  searchAccount() {
    const searchType = this.newRecipientForm.get('searchType')?.value;
    const accountSearchValue = this.newRecipientForm.get('accountSearch')?.value;

    if (searchType === 'cbu') {
      this.accountService.getAccountByCbu(accountSearchValue).subscribe({
        next: (id) => {
          this.accountService.getAccountById(id).subscribe({
            next: (account) => {
              this.account = account;
              if(this.account.closing_date){
                this.account = null;
                Swal.fire({
                  title: 'Cuenta no encontrada',
                  icon: 'error'
                })
                return;
              }
                if (this.account && this.account.user_id) {
                  this.userService.getUser(this.account.user_id).subscribe({
                    next: (user) => {
                      this.userDestino = user;
                      this.flag = true;
                    },
                    error: (error: Error) => console.log('Error al obtener el usuario:', error)
                  });
                }
                setTimeout(() => this.scrollToBottom(), 100);
              },
              error: (error: Error) => console.log('Error al obtener la cuenta por ID:', error)
          });
        },
        error: () => {
          Swal.fire({
            text: 'Cuenta no encontrada.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
          });
          this.errorMessage = 'Error al buscar la cuenta.';
          this.account = null;
          this.flag=false;
        },
      });
    } else if (searchType === 'alias') {
      this.accountService.getAccountByAlias(accountSearchValue).subscribe({
        next: (id) => {
          this.accountService.getAccountById(id).subscribe({
            next: (account) => {
              this.account = account;
              if(this.account.closing_date){
                this.account = null;
                Swal.fire({
                  title: 'Cuenta no encontrada',
                  icon: 'error'
                })
                return;
              }
                if (this.account && this.account.user_id) {
                  this.userService.getUser(this.account.user_id).subscribe({
                    next: (user) => {
                      this.userDestino = user;
                      this.flag = true;
                    },
                    error: (error: Error) => console.log('Error al obtener el usuario:', error)
                  });
                }
                setTimeout(() => this.scrollToBottom(), 100);
            },
            error: (error: Error) => console.log('Error al obtener la cuenta por ID:', error)
          });
        },
        error: () => {
          Swal.fire({
            text: 'Cuenta no encontrada.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
          });
          this.errorMessage = 'Error al buscar la cuenta.';
          this.account = null;
          this.flag=false;
          // return;
        },
      });
    }
  }

  cargarCuentas() {
    this.accountService.getAccountsByIdentifier(this.id).subscribe({
      next: (accounts: Account[]) => this.accounts = accounts.filter(account => account.closing_date == null),
      error: (error: Error) => console.error('Error fetching accounts:', error)
    });
  }

  realizarTransfer() {
    const selectedAccountId = this.amount.get('selectedAccountId')?.value;
    const selectedAccount = this.accounts.find((account) => account.id === Number(selectedAccountId));
    this.montoTransferencia = this.amount.get('amountToTransfer')?.value;
    let destinationAccount! : Account;

    if(selectedAccount?.id == this.account?.id){
      Swal.fire({
        text: 'No puede hacer una transferencia a la cuenta de origen.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8'
      });
      return;
    }

    if (!selectedAccount) {
      Swal.fire({
        text: 'Seleccione una cuenta de origen.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8',
      });
      return;
    }

    if(this.montoTransferencia as number < 1 ){
      Swal.fire({
        text: 'El monto mínimo para transferir es de $1.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8'
      })
      return;
    }

    if (this.montoTransferencia! > selectedAccount.balance) {
      Swal.fire({
        text: 'Saldo insuficiente',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8'
      });
      this.errorMessage = 'No tienes suficiente saldo para realizar la transferencia.';
      return;
    }

    Swal.fire({
      text: `¿Está seguro de transferir $${this.montoTransferencia} desde la cuenta ${selectedAccount.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, transferir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946"
    }).then((result) => {
      if (result.isConfirmed) {
        const transaction = {
          amount: this.montoTransferencia,
          source_account_id: selectedAccount.id,
          destination_account_id: this.account?.id,
          transaction_type: 'transfer'
        };

        // Emite la transacción cargada al padre
        this.transactionConfirmed.emit(this.transactionData);

        this.transactionService.postTransaction(transaction as Transaction).subscribe({
          next: () => {
            Swal.fire({
              text: '¡Transferencia realizada!',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#00b4d8'
            });

            this.sendNotification(transaction.destination_account_id);

            this.accountService.getAccountById(transaction.destination_account_id).subscribe({
              next: (account) =>{
                destinationAccount = account
                this.emailService.sendTransferEmail(this.user.email as string, this.montoTransferencia!, selectedAccount.user_id, destinationAccount.user_id).subscribe({
                  error: (error: Error) => console.log('Error al enviar el correo:', error)
                });
              },
              error: (e: Error) => console.log(e.message)
            })
          },
          error: (e: Error) => console.log('Error al realizar la transacción:', e.message),
        });

        const newAmount = -1 * (this.montoTransferencia as number);
        this.accountService.updateBalance(newAmount, selectedAccount.id).subscribe({
          error: (e: Error) => console.log(e.message),
        });

        this.accountService.updateBalance(this.montoTransferencia as number, this.account?.id).subscribe({
          error: (e: Error) => console.log(e.message),
        });

        this.router.navigate(['my-transactions']);
      }
    });
  }

  sendNotification(id: number) {
    this.accountService.getAccountById(id).subscribe({
      next: (account) =>{
        const notification = {
          title: 'Transferencia recibida!',
          message: 'Puede ver el comprobante en la seccion "Mis transferencias"',
          user_id: account.user_id
        }
        this.postNotification(notification)
      },
      error: (e: Error)=> console.log(e.message)
    })
  }

  postNotification(notification: any){
    this.notificationService.postNotification(notification).subscribe({
      error: (e: Error)=> console.log(e.message)
    })
  }

  scrollToBottom() {
    const lastElement = document.querySelector('.modal:last-child');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }
}
