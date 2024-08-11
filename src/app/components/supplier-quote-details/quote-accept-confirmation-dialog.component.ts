import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-quote-accept-confirmation-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, CommonModule],
    template: `
        <h2 mat-dialog-title>Confirm Quote Acceptance</h2>
        <div mat-dialog-content>
            <p>Are you sure you want to Accept this quote from {{ data.supplierName }}? This action can't be undone.</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onNoClick()">Cancel</button>
            <button mat-button color="primary" (click)="onYesClick()">Accept Quote</button>
        </div>
    `,
})
export class QuoteAcceptConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<QuoteAcceptConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { supplierName: string }
    ) {}

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
}