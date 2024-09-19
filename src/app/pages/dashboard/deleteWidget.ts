import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'app/components/material/material.module';

@Component({
    selector: 'app-delete-confirmation-modal',
    imports: [MaterialModule],
    standalone: true,
    template: `
    <h2 mat-dialog-title>Confirm Delete</h2>
    <mat-dialog-content>
      Are you sure you want to delete the "{{ data.itemName }}" widget?
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-button [mat-dialog-close]="true" color="warn">Confirm</button>
    </mat-dialog-actions>
  `,
    styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
    }
  `]
})
export class DeleteConfirmationModalComponent {
    constructor(
        public dialogRef: MatDialogRef<DeleteConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { itemName: string }
    ) { }
}