import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
@Component({
    selector: 'app-template-dialog',
    standalone: true,
    imports: [CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, MatDialogContent],
    template: `
        <h2 mat-dialog-title>{{ data.template.title }}</h2>
        <mat-dialog-content>
            <mat-form-field>
                <mat-label>Items</mat-label>
                <input matInput [(ngModel)]="data.template.items" />
            </mat-form-field>
        </mat-dialog-content>
        <button mat-button (click)="onNoClick()">Cancel</button>
        <button mat-button cdkFocusInitial>Save</button>
    `,
})
export class TemplateDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<TemplateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { template: any },
    ) {}

    onNoClick(): void {
        this.dialogRef.close();
    }
}
