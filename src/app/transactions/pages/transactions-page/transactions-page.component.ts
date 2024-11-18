import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/navbar/navbar.component';
import { Router, RouterLink } from '@angular/router';
import { TransferModalComponent } from "../../components/transfer-modal/transfer-modal.component";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NavbarComponent, TransferModalComponent, CommonModule],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css'
})
export class TransactionsPageComponent{
  isModalOpen = false;

  router = inject(Router)

  openModal() {
    this.isModalOpen = true;
  }
  goToNewTransfer(account: any) {
    this.isModalOpen = false;
    this.router.navigate(['/transactions/new-transfer'], { state: { account } });
  }
}
