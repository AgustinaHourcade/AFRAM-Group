import { Component, inject, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';
import { TransactionService } from '@transactions/services/transaction.service';
import { Transaction } from '@transactions/interface/transaction.interface';
import { Account } from '@accounts/interface/account.interface';
import { AccountService } from '@accounts/services/account.service';
import { User } from '@users/interface/user.interface';
import { UserService } from '@users/services/user.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { EmailService } from '@email/service/email.service';

@Component({
  selector: 'app-transfer-programming',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './transfer-programming.component.html',
  styleUrls: ['./transfer-programming.component.css'],
})
export class TransferProgrammingComponent implements OnInit {

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ account: Account; user: User }>();
  @Input() data: any;
  @Output() transactionConfirmed = new EventEmitter<Transaction>();
  confirmar = false;
  account: any = null;
  flag: boolean = false;
  errorMessage: string = '';
  user!: User;
  userDestino !: User;
  accounts!: Array<Account>;
  id !: number;
  origen!: Account;
  fechaValida: boolean = false;
  openModal: boolean = false;

  private router = inject(Router);
  private userSessionService = inject(UserSessionService);
  private userService = inject(UserService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private emailService = inject(EmailService);
  private montoTransferencia: number | null | undefined = 0
  private fb = inject(FormBuilder);

  showModal: boolean = false;
  minDate: string = '';
  maxDate: string = '';
  currentDate = Date.now();
  dateFromTimestamp: Date = new Date(this.currentDate);
  transferDate !: Date;

  ngOnInit(): void {
    this.id = this.userSessionService.getUserId();
    this.userService.getUser(this.id).subscribe({
      next: (user) => {
          this.user = user;
      },error: (e : Error) =>{
        console.log(e.message);
      }
    })
    this.cargarCuentas();
    this.setDateRange();
  }
  newRecipientForm = this.fb.group({
    searchType: ['alias', Validators.required],
    accountSearch: ['', Validators.required],
  });

  amount = this.fb.group({
    amountToTransfer: [1, [Validators.required, Validators.min(1)]],
    selectedAccountId: ['', [Validators.required]],
  });

  dateForm = this.fb.nonNullable.group({
  transaction_date: ['', [Validators.required]],
  });

  modalData: Transaction | null = null;
    realizarTransfer() {
      const selectedAccountId = this.amount.get('selectedAccountId')?.value;
      const selectedAccount = this.accounts.find(
        (account) => account.id === Number(selectedAccountId)
      );
      this.montoTransferencia = this.amount.get('amountToTransfer')?.value;
      if (selectedAccount?.id == this.account?.id) {
        Swal.fire({
          text: 'No puede hacer una transferencia a la cuenta de origen.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00b4d8',
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

      if (this.montoTransferencia! < 1) {
        Swal.fire({
          text: 'El monto mínimo para transferir es de $1.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00b4d8',
        });
        return;
      }

      if (this.montoTransferencia! > selectedAccount.balance) {
        Swal.fire({
          text: 'Saldo insuficiente',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00b4d8',
        });
        this.errorMessage = 'No tienes suficiente saldo para realizar la transferencia.';
        return;
      }

      const transaction_date_value = this.dateForm.get('transaction_date')?.value;
      console.log(transaction_date_value);

      if (!transaction_date_value) {
        Swal.fire({
          text: 'Por favor, seleccione una fecha de transferencia.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00b4d8',
        });
        return;
      }

      Swal.fire({
        text: `¿Está seguro de programar una transferencia de $${this.montoTransferencia} desde la cuenta ${selectedAccount.id},
        para el dia ${transaction_date_value}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, transferir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#00b4d8',
        cancelButtonColor: "#e63946"
      }).then((result) => {
        if (result.isConfirmed) {
      const transaction_date = new Date(transaction_date_value);
      console.log(transaction_date);

      const transactionData = {
        amount: this.montoTransferencia!,
        source_account_id: selectedAccount.id,
        destination_account_id: this.account?.id,
        transaction_type: 'transfer',
        transaction_date: transaction_date_value,
        is_paid: 'no',
      };

      const transaction: Transaction = {
        ...transactionData,
        transaction_date: new Date(transactionData.transaction_date),
      };

      console.log('aaaa'+ transaction.transaction_date);

      this.transactionConfirmed.emit(transaction);

      this.transactionService.postFutureTransaction(transaction).subscribe({
        next: () => {
          Swal.fire({
            text: '¡Transferencia programada!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8',
          });
          this.router.navigate(['my-transactions']);

          // if (this.user.email) {
          //   this.emailService
          //     .sendTransferEmail(
          //       this.user.email,
          //       this.montoTransferencia!,
          //       selectedAccount.user_id,
          //       this.account?.id
          //     )
          //     .subscribe({
          //       next: () => console.log('Correo de notificación enviado'),
          //       error: (error: Error) => console.log('Error al enviar el correo:', error),
          //     });
          // }
        },
        error: (e: Error) => console.log('Error al realizar la transacción:', e.message),
      });
    }
  })};

  setDateRange() {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    this.minDate = today.toISOString().split('T')[0];
    this.maxDate = nextMonth.toISOString().split('T')[0];
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
              }
                if (this.account && this.account.user_id) {
                  this.userService.getUser(this.account.user_id).subscribe({
                    next: (user) => {
                      this.userDestino = user;
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
              if(this.account.closing_date){
                this.account = null;
                Swal.fire({
                  title: 'Cuenta no encontrada',
                  icon: 'error'
                })
              }
                if (this.account && this.account.user_id) {
                  this.userService.getUser(this.account.user_id).subscribe({
                    next: (user) => {
                      this.userDestino = user;
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
            text: 'Cuenta no encontrada.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8'
          });
          this.errorMessage = 'Error al buscar la cuenta.';
          this.account = null;
        },
      });
    }

  }

  cargarCuentas() {
    this.accountService.getAccountsByIdentifier(this.id).subscribe({
      next: (accounts: Account[]) => {
        this.accounts = accounts;
        console.log(this.accounts);
      },
      error: (error: Error) => {
        console.error('Error fetching accounts:', error);
      },
    });
  }

  showModalAndScroll(){
    this.openModal = true;
    setTimeout(() => {
      this.scrollToBottom();
    }, 150);
  }

  scrollToBottom() {
    const lastElement = document.querySelector('.search');
    if (lastElement) {
      lastElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }



}
