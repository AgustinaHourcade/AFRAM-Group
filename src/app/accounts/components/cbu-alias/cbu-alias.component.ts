import { User } from './../../../users/interface/user.interface';
import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Account } from '../../interface/account.interface';
import { switchMap } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../users/services/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cbu-alias',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cbu-alias.component.html',
  styleUrl: './cbu-alias.component.css',
})
export class CbuAliasComponent implements OnInit {
  account!: Account;
  user!: User;

  router = inject(ActivatedRoute);
  route = inject(Router)
  userService = inject(UserService);
  accountService = inject(AccountService);
  fb = inject(FormBuilder);

  formulario = this.fb.nonNullable.group({
    newAlias: ['', [Validators.required, Validators.maxLength(15)]]
  })

  isEditing = false;

  ngOnInit(): void {
    this.router.paramMap
      .pipe(
        switchMap((params) => {
          return this.accountService.getAccountById( Number (params.get('id')));
        })
      )
      .subscribe((account) => {
        this.account = account;
        this.userService.getUser(this.account.user_id).subscribe({
          next: (user)  => {
            this.user = user
          },
          error: (error: Error) =>{
            console.log(error);
          }
        })
      });
  }


  toggleEditing() {
    this.isEditing = !this.isEditing;
  }

  modifyAlias() {
    const newAlias = this.formulario.get('newAlias')?.value;

    if(newAlias && newAlias.length > 15) {
      Swal.fire({
        title: 'La longitud máxima es de 15 caracteres',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }


    if(this.formulario.invalid) return;

    if (newAlias) {
      this.accountService.modifyAlias(this.account.id, newAlias).subscribe({
        next: (value) => {
          if (value) console.log('Modificado correctamente');
          this.account.alias = this.formulario.get('newAlias')?.value as string;
          this.isEditing = false;
          Swal.fire({
            title: 'Alias modificado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        },
        error: (err) => {
          Swal.fire({
            title: 'Error al modificar el alias',
            text: 'El alias elegido ya está en uso',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error al modificar alias:', err.message);
        },
      });
    }
  }

  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  downloadAsPDF() {
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

        pdf.save('cbu-alias.pdf');
      };
    });

    elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'inline'));
    element.classList.remove('pdf-only');
  }

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
          title: 'Se han copiado los datos de la cuenta',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        })
      })
      .catch((err) => {
        console.error('Error al copiar al portapapeles', err);
      });
  }

  ViewChild(
    arg0: string,
    arg1: { static: boolean }
  ): (target: CbuAliasComponent, propertyKey: 'pdfContent') => void {
    throw new Error('Function not implemented.');
  }
}
