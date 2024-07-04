import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-delete-confirmation-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, CommonModule],
    template: `
        <h2 mat-dialog-title>Confirmation</h2>
        <div mat-dialog-content>
            <p>{{ data.company_name }}: {{ data.contact_email }}</p>
            <p>Are you sure you want to delete this supplier?</p>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="onNoClick()">No</button>
            <button mat-button color="primary" (click)="onYesClick()">Yes</button>
        </div>
    `,
})
export class DeleteConfirmationDialogComponent {
    @Output() deleteConfirmed = new EventEmitter<void>();

    constructor(
        public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { company_name: string; contact_email: string }
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.deleteConfirmed.emit();
        this.dialogRef.close();
    }
}
