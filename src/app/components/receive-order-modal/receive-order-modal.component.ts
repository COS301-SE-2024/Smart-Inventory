import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';

interface OrderItem {
  sku: string;
  description: string;
  quantity: number;
  expirationDate: Date | null;
}

@Component({
  selector: 'app-receive-order-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatIconModule
  ],
  providers: [
    MatDatepickerModule,
    provideNativeDateAdapter()
  ],
  templateUrl: './receive-order-modal.component.html',
  styleUrls: ['./receive-order-modal.component.css']
})
export class ReceiveOrderModalComponent {
  displayedColumns: string[] = ['sku', 'description', 'quantity', 'expirationDate'];
  orderItems: OrderItem[] = [
    { sku: 'SKU001', description: 'Product 1', quantity: 10, expirationDate: null },
    { sku: 'SKU002', description: 'Product 2', quantity: 5, expirationDate: null },
    { sku: 'SKU003', description: 'Product 3', quantity: 8, expirationDate: null },
  ];

  constructor(
    public dialogRef: MatDialogRef<ReceiveOrderModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  markAsReceived() {
    this.dialogRef.close({ action: 'received', data: this.data });
  }

  close() {
    this.dialogRef.close();
  }
}