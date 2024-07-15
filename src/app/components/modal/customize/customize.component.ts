import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
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

  @Output() updateChartName = new EventEmitter<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { chartTitle: string },
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomizeComponent>
  ) {
    this.form = this.fb.group({
      chartName: [this.data.chartTitle]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const chartNameValue = this.form.get('chartName')?.value;
      if (chartNameValue) {
        this.updateChartName.emit(chartNameValue);
        console.log(chartNameValue);
      }
      this.dialogRef.close();
    }
  }
  

  close() {
    this.dialogRef.close();
  }
}
