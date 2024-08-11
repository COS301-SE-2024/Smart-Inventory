import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-order-received-confirmation-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, CommonModule],
    template: `
        <h2 mat-dialog-title>Confirmation</h2>
        <div mat-dialog-content>
            <p>Order ID: {{ data.Order_ID }}</p>
            <p>Are you sure you want to mark this order as received?</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onNoClick()">No</button>
            <button mat-button color="primary" (click)="onYesClick()">Yes</button>
        </div>
    `,
})
export class OrderReceivedConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<OrderReceivedConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { Order_ID: string }
    ) {}

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
}