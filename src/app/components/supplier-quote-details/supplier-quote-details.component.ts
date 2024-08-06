import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface QuoteItem {
  description: string;
  upc: string;
  sku: string;
  requestedQuantity: number;
  isAvailable: boolean;
  availableQuantity: number;
  unitCost: number;
  totalCost: number;
  discount: number;
  totalPrice: number;
}

interface QuoteSummary {
  vatPercentage: number;
  deliveryDate: string;
  deliveryCost: number;
  subtotal: number;
  vatAmount: number;
  totalQuoteValue: number;
  currency: string;
  additionalComments?: string;
}

@Component({
  selector: 'app-supplier-quote-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  templateUrl: './supplier-quote-details.component.html',
  styleUrl: './supplier-quote-details.component.css'
})
export class SupplierQuoteDetailsComponent {
  supplierInfo: any;
  quoteItems: QuoteItem[];
  quoteSummary: QuoteSummary;

  constructor(
    public dialogRef: MatDialogRef<SupplierQuoteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // Mock data for demonstration
    this.supplierInfo = {
      companyName: 'ABC Suppliers Ltd.',
      contactPerson: 'John Doe',
      email: 'john.doe@abcsuppliers.com',
      phone: '+1 234 567 8900',
      address: '123 Supplier Street, Supplier City, SC 12345, Country'
    };

    this.quoteItems = [
      {
        description: 'Item 1',
        upc: '123456789012',
        sku: 'SKU001',
        requestedQuantity: 100,
        isAvailable: true,
        availableQuantity: 90,
        unitCost: 10,
        totalCost: 900,
        discount: 5,
        totalPrice: 855
      },
      // Add more mock items as needed
    ];

    this.quoteSummary = {
      vatPercentage: 15,
      deliveryDate: '2024-08-15',
      deliveryCost: 50,
      subtotal: 855,
      vatAmount: 128.25,
      totalQuoteValue: 1033.25,
      currency: 'USD',
      additionalComments: 'This is a sample additional comment for the quote.'
    };
  }

  close(): void {
    this.dialogRef.close();
  }
}