import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CbuAliasComponent } from '../../components/cbu-alias/cbu-alias.component';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs';
import { Transaction } from '../../../transactions/interface/transaction.interface';
import { TransactionService } from '../../../transactions/services/transaction.service';
import { AccountService } from '../../services/account.service';
import { TransactionComponent } from '../../../transactions/components/transaction/transaction.component';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { UserSessionService } from '../../../auth/services/user-session.service';


@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CbuAliasComponent, NavbarComponent, ReactiveFormsModule, TransactionComponent, CommonModule],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.css'
})
export class AccountInfoComponent implements OnInit{
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  transactions: Array<Transaction> = [];
  filteredTransactions: Array<Transaction> = [];
  accountId!: number;
  openingDate!: Date;
  today: Date = new Date();
  isLastDayOfMonth: boolean = false;
  isDownloading = false;

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);
  private userSessionService = inject(UserSessionService);
  private router = inject(ActivatedRoute);

  dateForm = this.fb.nonNullable.group({
    monthYear: ['']
  });

  ngOnInit() {
    this.router.paramMap
      .pipe(
        switchMap((params) => {
          return this.accountService.getAccountById(Number(params.get('id')));
        })
      )
      .subscribe((account) => {
        this.accountId = account.id;
        this.openingDate = new Date(account.opening_date);
        this.setDefaultMonthYear();
        this.loadTransactions();
      });

    this.dateForm.get('monthYear')?.valueChanges.subscribe(() => {
      this.filterTransactions();
    });
    this.dateForm.get('monthYear')?.valueChanges.subscribe(() => {
      this.updateLastDayCheck();
    });

    this.updateLastDayCheck();
  }

  setDefaultMonthYear() {
    const currentMonthYear = `${this.today.getFullYear()}-${String(
      this.today.getMonth() + 1
    ).padStart(2, '0')}`;
    this.dateForm.patchValue({ monthYear: currentMonthYear });
    this.updateLastDayCheck();
  }

  loadTransactions() {
    this.transactionService.getTransactionsByAccountId(this.accountId).subscribe({
      next: (data) => {
        this.transactions = data;
        this.filterTransactions();
      },
      error: (err) => console.error('Error al cargar transacciones:', err),
    });
  }

  filterTransactions() {
    const selectedDate = this.dateForm.get('monthYear')?.value;

    if (!selectedDate) {
      this.filteredTransactions = [];
      return;
    }

    const [year, month] = selectedDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1); 
    const endDate = new Date(year, month, 0); 

    this.filteredTransactions = this.transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      return (
        transactionDate >= startDate && transactionDate <= endDate
      );
    });
  }
  updateLastDayCheck() { 
    const selectedDate = this.dateForm.get('monthYear')?.value;
    if (!selectedDate) return;
  
    const [year, month] = selectedDate.split('-').map(Number);
    const lastDay = new Date(year, month, 0); 
    const currentDate = new Date(); 
  
    this.isLastDayOfMonth = lastDay <= currentDate;
  }
  

  nextAvailableDate(monthYear: string | null): Date | null {
    if (!monthYear) return null;
    const [year, month] = monthYear.split('-').map(Number);
    return new Date(year, month, 0); 
  }

  downloadAsPDF() {
    this.isDownloading = true; 
    this.filterTransactions();
    

    setTimeout(() => {
      const element = this.pdfContent.nativeElement;
      const elementsToHide = element.querySelectorAll('.no-print');
      elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'none'));
      element.classList.add('pdf-only');

      html2canvas(element, {
        scale: 2,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: 'letter',
          putOnlyUsedFonts: true,
          floatPrecision: 16,
        });

        const logoUrl = '/logo-fff.png';
        const logoImg = new Image();
        logoImg.src = logoUrl;

        logoImg.onload = () => {
          const logoWidth = 3.125;
          const logoHeight = 1.5625;
          const xPos = pdf.internal.pageSize.getWidth() - logoWidth - 0.5;
          const yPos = 0.5;
          pdf.addImage(logoImg, 'JPEG', xPos, yPos, logoWidth, logoHeight);

          const imgWidth = 8.5;
          const pageHeight = 11;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          pdf.addImage(imgData, 'JPEG', 0, position + logoHeight + 0.5, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }
          const monthYear = this.dateForm.get('monthYear')?.value;
          const formattedDate = monthYear
            ? monthYear.replace('-', '_')
            : 'default_date'; 

          const accountDetails = `Resumen de cuenta\nCuenta ${this.accountId} - ${this.userSessionService.getUserId()}\nPeriodo: ${monthYear}`;

          pdf.setFontSize(14);
          pdf.text(accountDetails, 0.5, 1.5); 

          pdf.save(`Resumen-${this.accountId}-${formattedDate}.pdf`);
        };
      });

      elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'inline'));
      element.classList.remove('pdf-only');

      this.isDownloading = false;
    });
   }
}
