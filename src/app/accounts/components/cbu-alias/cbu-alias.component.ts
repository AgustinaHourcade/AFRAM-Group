import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { User } from '@users/interface/user.interface';
import { Account } from '@accounts/interface/account.interface';
import { UserService } from '@users/services/user.service';
import { AccountService } from '@accounts/services/account.service';
import { UserSessionService } from '@auth/services/user-session.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-cbu-alias',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cbu-alias.component.html',
  styleUrl: './cbu-alias.component.css',
})
export class CbuAliasComponent implements OnInit {

  // Dependency injections
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private userSessionService = inject(UserSessionService)
  private accountService = inject(AccountService);

  // Variables
  user!: User;
  account!: Account;
  accountId!: number;
  isEditing: boolean = false;

  // Reactive form to modify alias
  form = this.fb.nonNullable.group({
    newAlias: ['', [Validators.required, Validators.maxLength(15), Validators.minLength(5)]],
  });

  // Functions
  // Toggle edit mode
  toggleEditing() {
    this.isEditing = !this.isEditing;
  }

  // Modify account alias
  modifyAlias() {
    const newAlias = this.form.get('newAlias')?.value;

    // Alias validators
    if (this.account.alias === newAlias) {
      Swal.fire({
        title: 'El alias ingresado es idéntico al actual.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8',
      });
      return;
    }

    if (newAlias && newAlias.length > 15) {
      Swal.fire({
        title: 'La longitud máxima es de 15 caracteres.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8',
      });
    }

    if (newAlias && newAlias.length < 5) {
      Swal.fire({
        title: 'La longitud mínima es de 5 caracteres.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#00b4d8',
      });
    }

    if (this.form.invalid) return;

    if (newAlias) {
      this.accountService.modifyAlias(this.account.id, newAlias).subscribe({
        next: () => {
          this.account.alias = this.form.get('newAlias')?.value as string;
          this.isEditing = false;
          Swal.fire({
            title: 'Alias modificado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8',
          });
        },
        error: () => {
          Swal.fire({
            title: 'Error al modificar el alias',
            text: 'El alias elegido ya está en uso.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#00b4d8',
          });
        },
      });
    }
  }

  // Download content as PDF
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  downloadAsPDF() {
    const element = this.pdfContent.nativeElement;
    const elementsToHide = element.querySelectorAll('.no-print');
    elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'none'));
    element.classList.add('pdf-only');

    html2canvas(element, {
      scale: 4,
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

        pdf.save('cbu-alias.pdf');
      };
    });

    elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'inline'));
    element.classList.remove('pdf-only');
  }

  // Copy data to clipboard
  copyToClipboard() {
    const text = `
      CBU: ${this.account.cbu}
      Alias: ${this.account.alias}
      Titular: ${this.user.last_name} ${this.user.real_name}
      DNI: ${this.user.dni}
    `;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        Swal.fire({
          title: 'Se han copiado los datos de la cuenta.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#00b4d8',
        });
      })
      .catch((err) => {
        console.error('Error al copiar al portapapeles', err);
      });
  }

  ViewChild( arg0: string, arg1: { static: boolean }): (target: CbuAliasComponent, propertyKey: 'pdfContent') => void {
    throw new Error('Function not implemented.');
  }

  ngOnInit(): void {
    this.accountId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.accountId) {
      this.accountService.getAccountById(this.accountId).subscribe({
        next: (account) => {
          // Verify user access to account
          const userId = this.userSessionService.getUserId();
          if (account.user_id !== userId) {
            // Redirect if user does not have access
            this.router.navigate(['access-denied']); 
          } else {
            this.account = account;
            this.userService.getUser(this.account.user_id).subscribe({
              next: (user) => {
                this.user = user;
              },
              error: (error: Error) => console.log(error)
            });
          }
        },
        // Log error if fetching account fails
        error: (error) => console.error('Error al cargar la cuenta:', error)   }     
      );
    }
  }
}
