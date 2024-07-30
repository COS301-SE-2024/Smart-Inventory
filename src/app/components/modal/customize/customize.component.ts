import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './customize.component.html',
  styleUrl: './customize.component.css'
})
export class CustomizeComponent {
  form: FormGroup;

  @Output() addNewChart = new EventEmitter<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      chartType: string,
    },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomizeComponent>
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      data: ['', [Validators.required, this.validateJSON]]
      // Add more form controls as needed, e.g., for data series
    });
  }

  validateJSON(control: AbstractControl): {[key: string]: any} | null {
    try {
      JSON.parse(control.value);
    } catch (e) {
      return { 'invalidJSON': true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.valid) {
      const result = {
        chartType: this.data.chartType,
        title: this.form.get('title')?.value,
        data: JSON.parse(this.form.get('data')?.value)
      };
      this.dialogRef.close(result);
    }
  }

  close() {
    this.dialogRef.close();
  }
}