import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private baseUrl = 'http://localhost:3000/email'; 

  http = inject(HttpClient)

  sendTransferEmail(to: string, amount: number, sourceAccountId: number, destinationAccountId: number) {
    return this.http.post(`${this.baseUrl}/sendTransfer`, { to, amount, sourceAccountId, destinationAccountId });
  }}
