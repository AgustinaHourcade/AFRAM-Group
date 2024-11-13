import { UserSessionService } from './../../../auth/services/user-session.service';
import { Component, ElementRef, ViewChild, Input, OnInit, inject, EventEmitter, Output } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Transaction } from '../../interface/transaction.interface';
import { UserService } from '../../../users/services/user.service';
import { AccountService } from '../../../accounts/services/account.service';
import { Account } from '../../../accounts/interface/account.intarface';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.css'
})
export class ReceiptComponent implements OnInit{
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  @Input()
  transaction!: Transaction;

  userSessionService = inject(UserSessionService);
  userService = inject(UserService);
  accountService = inject(AccountService);

  id: number = this.userSessionService.getUserId();
  name: string | undefined ;
  lastName!: string| undefined ;

  ngOnInit(): void {
    this.getUserById(this.id)
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

      const logoUrl = '/logo-fff.png';
      const logoImg = new Image();
      logoImg.src = logoUrl;

      logoImg.onload = () => {
        const logoWidth = 2;
        const logoHeight = 1;
        const xPos = (pdf.internal.pageSize.getWidth() - logoWidth) / 2;
        const yPos = 0.3;

        pdf.addImage(logoImg, 'JPEG', xPos, yPos, logoWidth, logoHeight);
        pdf.save('comprobante-transferencia.pdf');
      };
    });

    elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'inline'));
  }

  account!: Account;
  
  getUserById(id: number){
    this.accountService.getAccountById(this.transaction.destination_account_id).subscribe({
    next: (account) => {
      this.account = account;
      this.userService.getUser(this.account.user_id).subscribe({
        next: (user) => {
          this.name = user?.real_name;
          this.lastName = user?.last_name 
        },
        error: (error) => {
          console.error('Error el usuario', error);
        }
      });
    },
    error: (error) => {
      console.error('Error al obtener la cuenta', error);
    }
  });
  }
  @Output() cancel = new EventEmitter<void>();

  onCancel(): void {
    this.cancel.emit(); 
  }
}
