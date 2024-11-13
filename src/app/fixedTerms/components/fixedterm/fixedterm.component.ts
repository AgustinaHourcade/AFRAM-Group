import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FixedTerm } from '../../interface/fixed-term';
import { FixedTermService } from '../../service/fixed-term.service';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fixedterm',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './fixedterm.component.html',
  styleUrl: './fixedterm.component.css'
})

export class FixedtermComponent {

  fb = inject(FormBuilder);

  constructor(
    private fixedTermService: FixedTermService,
    private router: Router
  ) {}

  formulario = this.fb.nonNullable.group({
    account_id: [0, [Validators.required, Validators.min(1)]],
    invested_amount: [0, [Validators.required, Validators.min(1)]],
    // interest_rate_id: [5, [Validators.required, Validators.min(1)]],
    start_date: [Date.now(), Validators.required],  // Definido por defecto como el día de hoy
    expiration_date: [Date.now() + 31536000000, Validators.required]  // 1 año de duración por defecto
  });

  ngOnInit(): void {
  }

  // Método para crear el plazo fijo
  createFixedTerm(): void {
    if (this.formulario.invalid) {
      return;
    }
      
      const newFixedTerm = this.formulario.getRawValue() as FixedTerm;

      this.fixedTermService.createFixedTerm(newFixedTerm).subscribe(
        (response) => {
          console.log('Plazo fijo creado', response);
          this.router.navigate(['/fixedterms']);
        },
        (error) => {
          console.error('Error al crear plazo fijo', error);
        }
      );

  }

}
