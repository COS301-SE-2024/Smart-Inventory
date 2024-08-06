import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface SupplierQuote {
  supplierName: string;
  totalQuoteValue: number;
  deliveryDate: Date;
  deliveryCost: number;
}

@Component({
  selector: 'app-received-quotes-side-pane',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './received-quotes-side-pane.component.html',
  styleUrls: ['./received-quotes-side-pane.component.css']
})
export class ReceivedQuotesSidePaneComponent {
  @Input() isOpen: boolean = false;
  @Input() selectedOrder: any;
  @Output() closed = new EventEmitter<void>();

  supplierQuotes: SupplierQuote[] = [
    {
      supplierName: 'Supplier A',
      totalQuoteValue: 1500.50,
      deliveryDate: new Date('2024-08-15'),
      deliveryCost: 50.00,
    },
    {
      supplierName: 'Supplier B',
      totalQuoteValue: 1450.75,
      deliveryDate: new Date('2024-08-20'),
      deliveryCost: 45.00,
    },
    {
      supplierName: 'Supplier C',
      totalQuoteValue: 1525.00,
      deliveryDate: new Date('2024-08-18'),
      deliveryCost: 55.00,
    }
  ];

  close() {
    this.closed.emit();
  }

  viewQuoteDetails(quote: SupplierQuote) {
    // Implement this method to show the modal with detailed quote information
    console.log('View details for:', quote);
  }
}