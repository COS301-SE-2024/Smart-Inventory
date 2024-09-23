import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'app/components/material/material.module';

@Component({
    selector: 'app-delete-confirmation-modal',
    imports: [MaterialModule],
    standalone: true,
    template: `
        <h1 mat-dialog-title style="text-align: center; --mdc-dialog-subhead-size: 30px">Confirm Delete</h1>
        <mat-dialog-content> Are you sure you want to delete the "{{ data.itemName }}" widget? </mat-dialog-content>
        <mat-dialog-actions>
            <button
                mat-flat-button
                [mat-dialog-close]="false"
                style="
    margin-right: auto;
    margin-left: auto;
    border-radius: 5px;
    width: 20px;
    height: 40px;"
            >
                Cancel
            </button>
            <button
                mat-flat-button
                [mat-dialog-close]="true"
                style="
    margin-right: auto;
    margin-left: auto;
    border-radius: 5px;
    width: 20px;
    height: 40px;"
            >
                Confirm
            </button>
        </mat-dialog-actions>
    `,
    styles: [
        `
            :host {
                display: block;
                width: 100%;
                max-width: 400px;
            }
        `,
    ],
})
export class DeleteConfirmationModalComponent {
    constructor(
        public dialogRef: MatDialogRef<DeleteConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { itemName: string },
    ) {}
}
