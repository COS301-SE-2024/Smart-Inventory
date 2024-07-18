import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from './custom-currency.pipe';

interface QuoteItem {
  description: string;
  sku: string;
  quantity: number;
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
        description: 'Product A',
        sku: 'SKU001',
        quantity: 10,
        unitCost: 250,
        totalCost: 2500,
        discount: 5,
        totalPrice: 2375
      },
      {
        description: 'Product B',
        sku: 'SKU002',
        quantity: 5,
        unitCost: 500,
        totalCost: 2500,
        discount: 10,
        totalPrice: 2250
      }
    ];
    this.updateAllTotals();
  }

  updateTotals(index: number) {
    const item = this.quoteItems[index];
    item.totalCost = item.quantity * item.unitCost;
    const discountAmount = item.totalCost * (item.discount / 100);
    item.totalPrice = item.totalCost - discountAmount;
  }

  updateAllTotals() {
    this.quoteItems.forEach((_, index) => this.updateTotals(index));
  }

  addItem() {
    this.quoteItems.push({
      description: '',
      sku: '',
      quantity: 0,
      unitCost: 0,
      totalCost: 0,
      discount: 0,
      totalPrice: 0
    });
  }

  removeItem(index: number) {
    this.quoteItems.splice(index, 1);
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
    // This method is called when the currency is changed
    // You can add any additional logic here if needed
    console.log('Currency updated to:', this.selectedCurrency);
  }
}