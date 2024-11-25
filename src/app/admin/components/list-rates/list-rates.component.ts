import { InterestRatesService } from './../../../interestRates/service/interest-rates.service';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarAdminComponent } from '../../shared/navbar-admin/navbar-admin.component';
import { InterestRates } from '../../../interestRates/interface/interest-rates.interface';

@Component({
  selector: 'app-list-rates',
  standalone: true,
  imports: [RouterLink, NavbarAdminComponent],
  templateUrl: './list-rates.component.html',
  styleUrl: './list-rates.component.css'
})
export class ListRatesComponent implements OnInit{

  private rateService = inject(InterestRatesService);
  rates: Array<InterestRates> = [];
  
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

}
