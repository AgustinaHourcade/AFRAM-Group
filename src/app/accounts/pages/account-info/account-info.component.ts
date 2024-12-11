import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { AccountService } from '@accounts/services/account.service';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { CbuAliasComponent } from '@accounts/components/cbu-alias/cbu-alias.component';
import { UserSessionService } from '@auth/services/user-session.service';
import { TransactionService } from '@transactions/services/transaction.service';
import { TransactionComponent } from '@transactions/components/transaction/transaction.component';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Transaction } from '@transactions/interface/transaction.interface';

@Component({
  selector: 'app-account-info',
  standalone: true,
  imports: [CbuAliasComponent, NavbarComponent, ReactiveFormsModule, TransactionComponent, CommonModule],
  templateUrl: './account-info.component.html',
  styleUrl: './account-info.component.css'
})

export class AccountInfoComponent implements OnInit{
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;
  @ViewChild(TransactionComponent) transactionComponent!: TransactionComponent;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private userSessionService = inject(UserSessionService);


  today: Date = new Date();
  accountId!: number;
  openingDate!: Date;
  transactions: Array<Transaction> = [];
  isDownloading = false;
  isLastDayOfMonth: boolean = false;
  filteredTransactions: Array<Transaction> = [];

  dateForm = this.fb.nonNullable.group({
    monthYear: ['']
  });

  ngOnInit(): void {
    this.accountId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.accountId) {
      this.accountService.getAccountById(this.accountId).subscribe({
        next: (account) => {
          if (!account || !account.user_id) {
            console.error('Cuenta no encontrada o respuesta inválida');
          this.router.navigate(['/not-found']);
            return;
          }
          
  
          const userId = this.userSessionService.getUserId();
          if (account.user_id !== userId) {
            console.log("No tiene acceso");
            this.router.navigate(['/access-denied']); // Redirige si el usuario no tiene acceso
          } else {
            this.accountId = account.id;
            this.openingDate = new Date(account.opening_date);
            this.setDefaultMonthYear();
            this.loadTransactions();
          }
        },
        error: (error) => {
          console.error('Error al cargar la cuenta:', error);
          this.router.navigate(['/not-found']);
        }}
      );


      this.dateForm.get('monthYear')?.valueChanges.subscribe(() => {
        this.filterTransactions();
      });
      this.dateForm.get('monthYear')?.valueChanges.subscribe(() => {
        this.updateLastDayCheck();
      });
  
      this.updateLastDayCheck();
    }
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
    if (!this.transactionComponent) {
      console.error('TransactionComponent no detectado');
      return;
    }

    const transactionElements = this.pdfContent.nativeElement.querySelectorAll('.transaction-card');
    transactionElements.forEach((transactionElement: HTMLElement) => {
      this.transactionComponent.applyPDFStyles(true, transactionElement);
    });

    const element = this.pdfContent.nativeElement;

    setTimeout(() => {
      const elementsToHide = element.querySelectorAll('.no-print');
      elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'none'));

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
          const logoWidth = 2.5;
          const logoHeight = 1.25;
          const xPos = pdf.internal.pageSize.getWidth() - logoWidth - 0.5;
          const yPos = 0.5;
          pdf.addImage(logoImg, 'JPEG', xPos, yPos, logoWidth, logoHeight);

          const imgWidth = 8.5;
          const pageHeight = 11;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;

          // Add image of PDF content
          pdf.addImage(imgData, 'JPEG', 0, position + logoHeight + 0.5, imgWidth, imgHeight);
          heightLeft -= pageHeight;

          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
          }

          const monthYear = this.dateForm.get('monthYear')?.value;
          const formattedDate = monthYear ? monthYear.replace('-', '_') : 'default_date';

          const accountDetails = `Resumen de cuenta\nCuenta ${this.accountId} - ${this.userSessionService.getUserId()}\nPeriodo: ${monthYear}`;

          // Add account details on the first page, above other elements
          pdf.setPage(1);
          const textMarginTop = logoHeight -0.3;
          const lineMarginTop = textMarginTop + 0.6;

          pdf.setFont('courier', 'normal');
          pdf.setFontSize(12);
          pdf.setTextColor(0, 0, 0);
          pdf.text(accountDetails, 0.5, textMarginTop);

          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.01);
          pdf.line(0.5, lineMarginTop, pdf.internal.pageSize.getWidth() - 0.5, lineMarginTop);

          pdf.save(`Resumen-${this.accountId}-${formattedDate}.pdf`);

          const transactionElements = this.pdfContent.nativeElement.querySelectorAll('.transaction-card');
          transactionElements.forEach((transactionElement: HTMLElement) => {
            this.transactionComponent.applyPDFStyles(false, transactionElement);
          });
          elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'inline'));

          this.isDownloading = false;
        };
      });
    });
  }



}
