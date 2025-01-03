import { Cotizacion } from '@shared/dolar/interface/cotizacion';
import { CommonModule } from '@angular/common';
import { DolarService } from '@shared/dolar/service/dolar.service';
import { Component, inject, OnInit } from '@angular/core';

@Component({
  selector: 'app-dolar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dolar.component.html',
  styleUrl: './dolar.component.css',
})
export class DolarComponent implements OnInit {
  private dolarService = inject(DolarService);
  dolar?: Cotizacion;

  ngOnInit(): void {
    this.dolarService.getDolarOficial().subscribe({
      next: (dolar) => this.dolar = dolar
    });
  }
}
