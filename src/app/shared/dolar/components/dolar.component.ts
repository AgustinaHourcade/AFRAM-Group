import { Component, inject, OnInit } from '@angular/core';
import { DolarService } from '../service/dolar.service';
import { Cotizacion } from '../interface/cotizacion';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dolar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dolar.component.html',
  styleUrl: './dolar.component.css',
})
export class DolarComponent implements OnInit {
  dolarService = inject(DolarService);
  dolar?: Cotizacion;

  ngOnInit(): void {
    this.dolarService.getDolarOficial().subscribe({
      next: (dolar) => {
        this.dolar = dolar;
      },
    });
  }
}
