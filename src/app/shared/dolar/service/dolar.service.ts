import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cotizacion } from '../interface/cotizacion';

@Injectable({
  providedIn: 'root'
})
export class DolarService {

  constructor() { }

  urlBase = "https://dolarapi.com";
  http = inject(HttpClient);

  getDolarOficial():Observable<Cotizacion>{
    return this.http.get<Cotizacion>(`${this.urlBase}/v1/dolares/oficial`)
  }
}
