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
import { Account } from '../../interface/account.intarface';
import { switchMap } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../users/services/user.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  userService = inject(UserService);
  accountService = inject(AccountService);
  fb = inject(FormBuilder);
  
  formulario = this.fb.nonNullable.group({
    newAlias: ['', Validators.required]
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
        console.log(account);
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
    console.log('toggleEditing called'); 
    this.isEditing = !this.isEditing;
  }

  // ! agregar verificacion, que sea Validators, que sea unico y que sea distinto al anterior
  modifyAlias() {
    console.log('modifyAlias called'); 
    const newAlias = this.formulario.get('newAlias')?.value;
    if (newAlias) {
      console.log("na" + newAlias);
      this.accountService.modifyAlias(this.account.id, newAlias).subscribe({
        next: (value) => {
          if (value) console.log('Modificado correctamente');
          this.isEditing = false; 
          window.location.reload();
        },
        error: (err) => {
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
        const logoWidth = 3.125;
        const logoHeight = 1.5625;
        const xPos = pdf.internal.pageSize.getWidth() - logoWidth - 0.5;
        const yPos = 0.5;

        pdf.addImage(logoImg, 'JPEG', xPos, yPos, logoWidth, logoHeight);

        pdf.save('mi-documento.pdf');
      };
    });
    elementsToHide.forEach((el: HTMLElement) => (el.style.display = 'inline')); //
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
        alert('Datos copiados al portapapeles');
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
