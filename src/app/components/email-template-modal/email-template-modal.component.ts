import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-email-template-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './email-template-modal.component.html',
  styleUrl: './email-template-modal.component.css'
})
export class EmailTemplateModalComponent {
  emailForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EmailTemplateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.emailForm = this.fb.group({
      greeting: ['Dear Supplier,', Validators.required],
      explanation: ['We are requesting a quote for the following items:', Validators.required],
      requirements: ['Please provide your best price and delivery time for these items.', Validators.required],
      instructions: ['Submit your quote through our web form.', Validators.required],
      contactInfo: ['If you have any questions, please contact us.', Validators.required]
    });

    if (data && data.emailTemplate) {
      this.emailForm.patchValue(data.emailTemplate);
    }
  }

  onSave() {
    if (this.emailForm.valid) {
      this.dialogRef.close(this.emailForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(controlName: string): string {
    const control = this.emailForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    return '';
  }
}