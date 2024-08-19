import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-role-change-confirmation-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, CommonModule],
    template: `
        <h2 mat-dialog-title>Confirm Role Change</h2>
        <div mat-dialog-content>
            <p>{{ data.given_name }} {{ data.family_name }}: {{ data.email }}</p>
            <p>
                Are you sure you want to change this user's role from
                <strong class="old-role">{{ data.oldRole }}</strong> to
                <strong class="new-role">{{ data.newRole }}</strong
                >?
            </p>
        </div>
        <div mat-dialog-actions>
            <button
                mat-stroked-button
                (click)="onNoClick()"
                style="border-radius: 20px;margin-right: 10px;--mdc-outlined-button-label-text-color: black;--mdc-outlined-button-outline-color: #74777f;border-radius: 5px; width: 20px;height: 40px;"
            >
                Cancel
            </button>
            <button
                mat-stroked-button
                color="primary"
                (click)="onYesClick()"
                style="border-radius: 20px;margin-right: 10px;--mdc-outlined-button-label-text-color: black;--mdc-outlined-button-outline-color: #74777f;border-radius: 5px; width: 20px;height: 40px;"
            >
                Confirm
            </button>
        </div>
    `,
    styles: [
        `
            .old-role {
                color: #9c27b0;
                font-weight: bold;
            }
            .new-role {
                color: #009688;
                font-weight: bold;
            }
        `,
    ],
})
export class RoleChangeConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<RoleChangeConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { given_name: string; family_name: string; email: string; oldRole: string; newRole: string },
    ) {}

    onNoClick(): void {
        this.dialogRef.close(false);
    }

    onYesClick(): void {
        this.dialogRef.close(true);
    }
}
