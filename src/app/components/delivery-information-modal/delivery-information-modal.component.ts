import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

interface DeliveryAddress {
  company: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions: string;
  contactName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-delivery-information-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './delivery-information-modal.component.html',
  styleUrl: './delivery-information-modal.component.css'
})
export class DeliveryInformationModalComponent {
  deliveryForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DeliveryInformationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { deliveryAddress: DeliveryAddress },
    private fb: FormBuilder
  ) {
    this.deliveryForm = this.fb.group({
      company: [data.deliveryAddress.company, Validators.required],
      street: [data.deliveryAddress.street, Validators.required],
      city: [data.deliveryAddress.city, Validators.required],
      state: [data.deliveryAddress.state, Validators.required],
      postalCode: [data.deliveryAddress.postalCode, Validators.required],
      country: [data.deliveryAddress.country, Validators.required],
      instructions: [data.deliveryAddress.instructions],
      contactName: [data.deliveryAddress.contactName, Validators.required],
      email: [data.deliveryAddress.email, [Validators.required, Validators.email]],
      phone: [data.deliveryAddress.phone, Validators.required]
    });
  }

  onSave() {
    if (this.deliveryForm.valid) {
      this.dialogRef.close(this.deliveryForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(field: string): string {
    const control = this.deliveryForm.get(field);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}