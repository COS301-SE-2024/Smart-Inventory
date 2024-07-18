import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from './custom-currency.pipe';

interface QuoteItem {
  description: string;
  sku: string;
  requestedQuantity: number;
  isAvailable: boolean;
  availableQuantity: number;
  unitCost: number;
  totalCost: number;
  discount: number;
  totalPrice: number;
}

interface Currency {
  code: string;
  name: string;
}

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCurrencyPipe],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent implements OnInit {
  quoteItems: QuoteItem[] = [];
  selectedCurrency: string = 'ZAR';
  currencies: Currency[] = [
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
  ];

  ngOnInit() {
    // Initialize with mock data
    this.quoteItems = [
      {
        description: 'High-Performance Laptop',
        sku: 'TECH001',
        requestedQuantity: 10,
        isAvailable: true,
        availableQuantity: 10,
        unitCost: 15000,
        totalCost: 150000,
        discount: 5,
        totalPrice: 142500
      },
      {
        description: 'Ergonomic Office Chair',
        sku: 'FURN002',
        requestedQuantity: 20,
        isAvailable: true,
        availableQuantity: 18,
        unitCost: 2000,
        totalCost: 36000,
        discount: 10,
        totalPrice: 32400
      },
      {
        description: 'Wireless Mouse',
        sku: 'ACC003',
        requestedQuantity: 50,
        isAvailable: true,
        availableQuantity: 50,
        unitCost: 300,
        totalCost: 15000,
        discount: 2,
        totalPrice: 14700
      },
      {
        description: '4K Monitor',
        sku: 'DISP004',
        requestedQuantity: 15,
        isAvailable: true,
        availableQuantity: 12,
        unitCost: 5000,
        totalCost: 60000,
        discount: 7,
        totalPrice: 55800
      },
      {
        description: 'Wireless Keyboard',
        sku: 'ACC005',
        requestedQuantity: 30,
        isAvailable: true,
        availableQuantity: 30,
        unitCost: 500,
        totalCost: 15000,
        discount: 3,
        totalPrice: 14550
      },
      {
        description: 'Desk Lamp',
        sku: 'LIGHT006',
        requestedQuantity: 25,
        isAvailable: true,
        availableQuantity: 20,
        unitCost: 250,
        totalCost: 5000,
        discount: 0,
        totalPrice: 5000
      },
      {
        description: 'Whiteboard',
        sku: 'OFF007',
        requestedQuantity: 5,
        isAvailable: true,
        availableQuantity: 5,
        unitCost: 1000,
        totalCost: 5000,
        discount: 5,
        totalPrice: 4750
      }
    ];
    this.updateAllTotals();
  }

  updateTotals(index: number) {
    const item = this.quoteItems[index];
    if (item.isAvailable) {
      item.totalCost = item.availableQuantity * item.unitCost;
      const discountAmount = item.totalCost * (item.discount / 100);
      item.totalPrice = item.totalCost - discountAmount;
    } else {
      item.totalCost = 0;
      item.totalPrice = 0;
    }
  }

  updateAllTotals() {
    this.quoteItems.forEach((_, index) => this.updateTotals(index));
  }

  onAvailabilityChange(index: number) {
    const item = this.quoteItems[index];
    if (!item.isAvailable) {
      item.availableQuantity = 0;
      item.unitCost = 0;
      item.discount = 0;
    } else {
      item.availableQuantity = item.requestedQuantity;
    }
    this.updateTotals(index);
  }

  getTotalQuoteValue(): number {
    return this.quoteItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  submitQuote() {
    console.log('Quote submitted:', this.quoteItems);
    console.log('Selected currency:', this.selectedCurrency);
    // Here you would typically send the data to a server
  }

  updateCurrency() {
    console.log('Currency updated to:', this.selectedCurrency);
    // You can add any currency conversion logic here if needed
  }
}