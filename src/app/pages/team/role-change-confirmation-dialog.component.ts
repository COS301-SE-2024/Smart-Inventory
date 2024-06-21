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
      <p>{{ data.given_name }} {{ data.family_name }} : {{ data.email }}</p>
      <p>Are you sure you want to change this user's role to {{ data.newRole }}?</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button color="primary" (click)="onYesClick()">Confirm</button>
    </div>
  `,
})
export class RoleChangeConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RoleChangeConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { given_name: string, family_name: string, email: string, newRole: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}