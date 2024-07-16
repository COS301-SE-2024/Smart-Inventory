import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      chartTitle: string,
      chartType: string,
    },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomizeComponent>
  ) {
    this.form = this.fb.group({
      chartName: [this.data.chartTitle, Validators.required],
      chartType: [this.data.chartType, Validators.required],
      // Add more form controls as needed, e.g., for data series
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const newChartConfig = {
        name: this.form.get('chartName')?.value,
        type: this.form.get('chartType')?.value,
        // Add more properties as needed
      };
      this.addNewChart.emit(newChartConfig);
      this.dialogRef.close(newChartConfig);
    }
  }

  close() {
    this.dialogRef.close();
  }
}