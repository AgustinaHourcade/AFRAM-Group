import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Account } from '@accounts/interface/account.interface';
import { Transaction } from '@transactions/interface/transaction.interface';
import { UserService } from '@users/services/user.service';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { Component, ElementRef, ViewChild, Input, OnInit, inject, EventEmitter, Output } from '@angular/core';


@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.css'
})

export class ReceiptComponent implements OnInit{
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  @Input()
  transaction!: Transaction;
  
  private userService = inject(UserService);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);

  id: number = this.userSessionService.getUserId();
  nameS: string | undefined ;
  nameD: string | undefined ;
  typeS!: string | undefined;
  typeD!: string | undefined;
  lastNameS!: string | undefined ;
  lastNameD!: string | undefined ;

  ngOnInit(): void {
    this.getUserById(/*this.id*/)
  }

  downloadAsPDF() {
    const element = this.pdfContent.nativeElement;
    const elementsToHide = element.querySelectorAll('.no-print');
    elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'none'));

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter',
        putOnlyUsedFonts: true,
        floatPrecision: 16
      });

      const imgWidth = 8.5;
      const pageHeight = 11;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('comprobante-transferencia.pdf');
    });

    elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'inline'));
  }

  account!: Account;

  getUserById(/*id: number*/){
    this.accountService.getAccountById(this.transaction.destination_account_id).subscribe({
    next: (account) => {
      this.account = account;
      this.userService.getUser(this.account.user_id).subscribe({
        next: (user) => {
          this.nameD = user?.real_name;
          this.lastNameD = user?.last_name
          if (account.account_type == "Savings"){
            this.typeD = "CA";
          }else{
            this.typeD = "CC";
          }
        },
        error: (error) => {
          console.error('Error el usuario', error);
        }
      });
    },
    error: (error) => {
      console.error('Error al obtener la cuenta', error);
    } })

    this.accountService.getAccountById(this.transaction.source_account_id).subscribe({
      next: (account: Account) => {
        this.account = account;
        this.userService.getUser(this.account.user_id).subscribe({
          next: (user) => {
            this.nameS = user?.real_name;
            this.lastNameS = user?.last_name
            if (account.account_type == "Savings"){
              this.typeS = "CA";
            }else{
              this.typeS = "CC";
            }
          },
          error: (error) => {
            console.error('Error el usuario', error);
          }
        });
      },
      error: (error: Error) => {
        console.error('Error al obtener la cuenta', error);
      }
  })

}
  @Output() cancel = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit();
  }

  // formatearFecha(date : Date){
  //   const formattedDate = new Date(date).toLocaleDateString('es-ES', {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric'
  //   });
  //   return formattedDate;
  // }
}
