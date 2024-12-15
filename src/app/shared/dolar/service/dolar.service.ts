import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cotizacion } from '@shared/dolar/interface/cotizacion';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DolarService {
  private http = inject(HttpClient);

  urlBase = "https://dolarapi.com";

  getDolarOficial():Observable<Cotizacion>{
    return this.http.get<Cotizacion>(`${this.urlBase}/v1/dolares/oficial`)
  }
}
