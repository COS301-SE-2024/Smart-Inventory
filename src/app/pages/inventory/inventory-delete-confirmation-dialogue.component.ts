import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-inventory-delete-confirmation-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, CommonModule],
    template: `
        <h1 mat-dialog-title style="text-align: center; --mdc-dialog-subhead-size: 30px">Confirmation</h1>
        <div mat-dialog-content>
            <p>SKU: {{ data.sku }}</p>
            <p>Are you sure you want to delete this inventory item?</p>
        </div>
        <div mat-dialog-actions>
            <button
                mat-flat-button
                (click)="onNoClick()"
                style="
    margin-right: auto;
    margin-left: auto;
    border-radius: 5px;
    width: 20px;
    height: 40px;"
            >
                No
            </button>
            <button
                mat-flat-button
                (click)="onYesClick()"
                style="
    margin-right: auto;
    margin-left: auto;
    border-radius: 5px;
    width: 20px;
    height: 40px;"
            >
                Yes
            </button>
        </div>
    `,
})
export class InventoryDeleteConfirmationDialogComponent {
    @Output() deleteConfirmed = new EventEmitter<void>();

    constructor(
        public dialogRef: MatDialogRef<InventoryDeleteConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { sku: string },
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.deleteConfirmed.emit();
        this.dialogRef.close();
    }
}
