import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { InterestRates } from '@interestRates/interface/interest-rates.interface';
import { InterestRatesService } from '@interestRates/service/interest-rates.service';
import { NavbarAdminComponent } from '@admin/shared/navbar-admin/navbar-admin.component';

@Component({
  selector: 'app-list-rates',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarAdminComponent, CommonModule],
  templateUrl: './list-rates.component.html',
  styleUrl: './list-rates.component.css'
})
export class ListRatesComponent implements OnInit{

  private fb = inject(FormBuilder);
  private rateService = inject(InterestRatesService);

  flag = false;
  rates : Array<InterestRates> = [];
  showingBubble: string | null = null;

  ngOnInit(): void {
    this.rateService.getRates().subscribe({
      next: (rates) =>{
        this.rates = rates;
      },
      error: (e: Error) =>{
        console.log(e.message);
      }
    })
  }

  formulario = this.fb.nonNullable.group({
    loan_interest_rate: ['', [Validators.required, Validators.min(0)]],
    fixed_term_interest_rate: ['', [Validators.required, Validators.min(0.0001)]]
  })

  // Funtion to generate a new rate
  newRate(){
    const loan_interest_rate = this.formulario.get('loan_interest_rate')?.value;
    const fixed_term_interest_rate = this.formulario.get('fixed_term_interest_rate')?.value;

    Swal.fire({
      title: `¿Está seguro que desea crear una nueva tasa de interes?`,
      text: 'Esta tasa será utilizada para los futuros préstamos y plazos fijos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#00b4d8',
      cancelButtonColor: "#e63946",
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.rateService.postRates(Number(loan_interest_rate), Number (fixed_term_interest_rate)).subscribe({
          next: (data) =>{
            Swal.fire({
              title: 'Nueva tasa creada correctamente!',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#00b4d8'
            })
          },
          error: (e: Error) =>{
            console.log(e.message);
          }
        })
        window.location.reload();
      } else {
        this.flag = false;
      }
    });

  }

  showBubble(type: string) {
    this.showingBubble = type;
  }

  hideBubble() {
    this.showingBubble = null;
  }

}
