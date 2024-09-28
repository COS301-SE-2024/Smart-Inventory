import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-request-stock-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './request-stock-modal.component.html',
  styleUrls: ['./request-stock-modal.component.css']
})
export class RequestStockModalComponent {
  requestForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<RequestStockModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sku: string, supplier: string, availableQuantity: number },
    private fb: FormBuilder
  ) {
    this.requestForm = this.fb.group({
      quantity: [null, [Validators.required, Validators.min(1), Validators.max(this.data.availableQuantity)]]
    });
  }

  onRequest() {
    if (this.requestForm.valid) {
      this.dialogRef.close(this.requestForm.value.quantity);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}