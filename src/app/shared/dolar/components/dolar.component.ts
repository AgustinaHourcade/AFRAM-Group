import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cotizacion } from '@shared/dolar/interface/cotizacion';
import { DolarService } from '@shared/dolar/service/dolar.service';

@Component({
  selector: 'app-dolar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dolar.component.html',
  styleUrl: './dolar.component.css',
})
export class DolarComponent implements OnInit {
  // ! LISTO
  private dolarService = inject(DolarService);
  dolar?: Cotizacion;

  ngOnInit(): void {
    this.dolarService.getDolarOficial().subscribe({
      next: (dolar) => {
        this.dolar = dolar;
      },
    });
  }
}
