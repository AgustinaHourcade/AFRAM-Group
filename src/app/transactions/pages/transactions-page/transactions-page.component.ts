import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '@shared/navbar/navbar.component';
import { TransferModalComponent } from "@transactions/components/transfer-modal/transfer-modal.component";
import { TransferProgrammingComponent } from "@transactions/components/transfer-programming/transfer-programming.component";

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [NavbarComponent, TransferModalComponent, CommonModule, TransferProgrammingComponent, RouterModule],
  templateUrl: './transactions-page.component.html',
  styleUrl: './transactions-page.component.css'
})
export class TransactionsPageComponent{
  isModalOpen = false;
  appTransferProgramming = false;
  appTransferModal = false;

  private router = inject(Router)

  openModal() {
    this.isModalOpen = true;
  }
  goToNewTransfer(account: any) {
    this.isModalOpen = false;
    this.router.navigate(['/transactions/new-transfer'], { state: { account } });
  }

  openAppTransferProgramming(){
    this.appTransferProgramming = true;
  }

  openAppTransferModal(){
    this.appTransferModal = true;
  }

  closeAppTransferProgramming(){
    this.appTransferProgramming = false;
  }

  closeAppTransferModal(){
    this.appTransferModal = false;
  }
}
