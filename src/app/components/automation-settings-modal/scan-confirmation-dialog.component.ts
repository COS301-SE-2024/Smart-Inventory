// scan-confirmation-dialog.component.ts
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-scan-confirmation-dialog',
    template: `
        <h2 mat-dialog-title>Confirm Inventory Scan</h2>
        <mat-dialog-content> Are you sure you want to initiate an inventory scan now? </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button
                mat-flat-button
                mat-dialog-close
                style="margin-right: auto;
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
                cdkFocusInitial
                style="margin-right: auto;
    margin-left: auto;
    border-radius: 5px;
    width: 20px;
    height: 40px;"
            >
                Confirm
            </button>
        </mat-dialog-actions>
    `,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
})
export class ScanConfirmationDialogComponent {
    constructor(public dialogRef: MatDialogRef<ScanConfirmationDialogComponent>) {}
}
