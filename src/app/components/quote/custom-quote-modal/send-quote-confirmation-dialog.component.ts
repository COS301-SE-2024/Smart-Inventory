import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-send-quote-confirmation-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Confirmation</h2>
    <div mat-dialog-content>
      <p>Are you sure you want to send this quote (QuoteID: {{data.quoteId}}) to suppliers?</p>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">No</button>
      <button mat-button color="primary" (click)="onYesClick()">Yes</button>
    </div>
  `,
})
export class SendQuoteConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SendQuoteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quoteId: string }
  ) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}