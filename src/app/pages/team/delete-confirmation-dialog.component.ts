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
            <p>{{ data.given_name }} {{ data.family_name }}: {{ data.email }}</p>
            <p>Are you sure you want to delete this user?</p>
        </div>
        <div mat-dialog-actions>
            <button
                mat-stroked-button
                (click)="onNoClick()"
                style="border-radius: 20px;margin-right: 10px;--mdc-outlined-button-label-text-color: black;--mdc-outlined-button-outline-color: #74777f;border-radius: 5px; width: 20px;height: 40px;"
            >
                No
            </button>
            <button
                mat-stroked-button
                color="primary"
                (click)="onYesClick()"
                style="border-radius: 20px;margin-right: 10px;--mdc-outlined-button-label-text-color: black;--mdc-outlined-button-outline-color: #74777f;border-radius: 5px; width: 20px;height: 40px;"
            >
                Yes
            </button>
        </div>
    `,
})
export class DeleteConfirmationDialogComponent {
    @Output() deleteConfirmed = new EventEmitter<void>();

    constructor(
        public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { given_name: string; family_name: string; email: string },
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }

    onYesClick(): void {
        this.deleteConfirmed.emit();
        this.dialogRef.close();
    }
}
