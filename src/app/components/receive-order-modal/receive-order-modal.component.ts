import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { OrderReceivedConfirmationDialogComponent } from './OrderReceivedConfirmationDialogComponent';


@Component({
  selector: 'app-receive-order-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './receive-order-modal.component.html',
  styleUrl: './receive-order-modal.component.css'
})
export class ReceiveOrderModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ReceiveOrderModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {}

  markAsReceived() {
    const confirmDialog = this.dialog.open(OrderReceivedConfirmationDialogComponent, {
      width: '350px',
      data: { Order_ID: this.data.Order_ID }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close({ action: 'received', data: this.data });
      }
    });
  }
}