import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';

@Component({
  selector: 'app-transfer-programming',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TransferModalComponent],
  templateUrl: './transfer-programming.component.html',
  styleUrls: ['./transfer-programming.component.css'],
})
export class TransferProgrammingComponent {
  private fb = inject(FormBuilder);

  showModal: boolean = false;

  programmingForm = this.fb.group({
    transferDate: ['', Validators.required],
  });

  modalData: any = null;

  onSubmit() {
    if (this.programmingForm.invalid) {
      return;
    }

    this.modalData = this.programmingForm.getRawValue();

    this.showModal = true;
  }

  onCloseModal() {
    this.showModal = false;
  }

  onConfirmModal(event: any) {
    console.log('Transferencia confirmada:', event);
    this.showModal = false;
  }
}
