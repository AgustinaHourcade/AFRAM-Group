import { InterestRatesService } from './../../../interestRates/service/interest-rates.service';
import { Component, inject, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';
import { InterestRates } from '../../../interestRates/interface/interest-rates.interface';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list-rates',
  standalone: true,
  imports: [ReactiveFormsModule, NavbarAdminComponent, CommonModule],
  templateUrl: './list-rates.component.html',
  styleUrl: './list-rates.component.css'
})
export class ListRatesComponent implements OnInit{

  private rateService = inject(InterestRatesService);
  private fb = inject(FormBuilder);
  private route = inject(Router);
  rates: Array<InterestRates> = [];
  flag = false;

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
    fixed_term_interest_rate: ['', [Validators.required, Validators.min(0)]]
  })

  newRate(){
    const loan_interest_rate = this.formulario.get('loan_interest_rate')?.value;
    const fixed_term_interest_rate = this.formulario.get('fixed_term_interest_rate')?.value;

    Swal.fire({
      title: `¿Está seguro que desea crear una nueva tasa de interes?`,
      text: 'Esta tasa sera utilizada para los futuros prestamos y plazos fijos',
      icon: 'question',
      iconColor: '#0077b6',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.rateService.postRates(Number(loan_interest_rate), Number (fixed_term_interest_rate)).subscribe({
          next: (data) =>{
            Swal.fire({
              title: 'Nueva tasa creada correctamente!',
              icon: 'success',
              confirmButtonText: 'Aceptar'
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

}
