import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Transaction } from '@transactions/interface/transaction.interface';
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

  // Dependency Injections
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);
  private userSessionService = inject(UserSessionService);

  // Variables
  today: Date = new Date();
  accountId!: number;
  openingDate!: Date;
  transactions: Array<Transaction> = [];
  isDownloading: boolean = false;
  isLastDayOfMonth: boolean = false;
  openedTransactionId: number | undefined = undefined;
  filteredTransactions: Array<Transaction> = [];

  // Reactive form for date selection
  dateForm = this.fb.nonNullable.group({
    monthYear: ['']
  });

  // Functions
  // Set default month and year to the current date
  setDefaultMonthYear() {
    const currentMonthYear = `${this.today.getFullYear()}-${String(
      this.today.getMonth() + 1
    ).padStart(2, '0')}`;
    this.dateForm.patchValue({ monthYear: currentMonthYear });
    this.updateLastDayCheck();
  }

  // Load transactions for the account
  loadTransactions() {
    this.transactionService.getTransactionsByAccountId(this.accountId).subscribe({
      next: (data) => {
        this.transactions = data;
        this.filterTransactions();
      },
      error: (err) => console.error('Error al cargar transacciones:', err),
    });
  }

  // Filter transactions based on selected date
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

  // Check if today is the last day of the selected month
  updateLastDayCheck() {
    const selectedDate = this.dateForm.get('monthYear')?.value;
    if (!selectedDate) return;

    const [year, month] = selectedDate.split('-').map(Number);
    const lastDay = new Date(year, month, 0);
    const currentDate = new Date();

    this.isLastDayOfMonth = lastDay <= currentDate;
  }

  // Get the next available date for the summary
  nextAvailableDate(monthYear: string | null): Date | null {
    if (!monthYear) return null;
    const [year, month] = monthYear.split('-').map(Number);
    return new Date(year, month, 0);
  }

  // Download the transactions summary as PDF
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

  // Toggles the openedTransactionId between the provided transactionId and undefined
  toggleReceipt(transactionId: number|undefined): void {
    this.openedTransactionId = this.openedTransactionId === transactionId ? undefined : transactionId;
  }

  // Checks if the given transactionId matches the currently opened transaction
  isReceiptOpen(transactionId: number|undefined): boolean {
    return this.openedTransactionId === transactionId;
  }

  ngOnInit(): void {
    this.accountId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.accountId) {
      this.accountService.getAccountById(this.accountId).subscribe({
        next: (account) => {      
          const userId = this.userSessionService.getUserId();
          // Verify if user has access to the account
          if (account.user_id !== userId) {
            this.router.navigate(['/access-denied']); 
          } else {
            this.accountId = account.id;
            this.openingDate = new Date(account.opening_date);
            this.setDefaultMonthYear();
            this.loadTransactions();
          }
        },
        error: (error) => {
          this.router.navigate(['/not-found']);
        }}
      );

      // Subscribe to date changes
      this.dateForm.get('monthYear')?.valueChanges.subscribe(() => {
        this.filterTransactions();
      });
      
      this.dateForm.get('monthYear')?.valueChanges.subscribe(() => {
        this.updateLastDayCheck();
      });

      this.updateLastDayCheck();
    }
  }
}
