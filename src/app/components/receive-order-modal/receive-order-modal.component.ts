import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

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
    this.dialogRef.close({ action: 'received', data: this.data });
  }
}