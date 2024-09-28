import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button'; // Import MatButtonModule

@Component({
  selector: 'app-confirm-dialog',
  standalone: true, 
  imports: [MatDialogModule, MatButtonModule], // Add MatButtonModule to imports
  template: `
    <h2 mat-dialog-title>Confirm Action</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button color="primary" [mat-dialog-close]="false">Cancel</button> 
      <button mat-button  [mat-dialog-close]="true">Confirm</button> 
    </mat-dialog-actions>
  `,
})
export class confirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<confirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}
}