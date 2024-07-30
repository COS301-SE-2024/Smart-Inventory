import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from './custom-currency.pipe';
import { MatDialog } from '@angular/material/dialog';
import { UpdateContactConfirmationComponent } from './update-contact-confirmation.component';
import { ActivatedRoute } from '@angular/router';

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

interface DeliveryAddress {
  company: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions: string;
  contactName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomCurrencyPipe],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.css'
})
export class SupplierFormComponent implements OnInit {

  supplierID: string = '';
  orderID: string = '';


  constructor(private dialog: MatDialog, private route: ActivatedRoute) {}

  openUpdateContactModal() {
    const dialogRef = this.dialog.open(UpdateContactConfirmationComponent, {
      width: '350px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendUpdateContactRequest();
      }
    });
  }

  sendUpdateContactRequest() {
    // Implement the logic to send the update contact request
    console.log('Sending update contact request');
    // You would typically make an API call here
  }

  additionalComments: string = '';
  selectedFiles: File[] = [];
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

  submissionDeadline: string = '2024-08-15T17:00:00'; 

  deliveryAddress: DeliveryAddress = {
    company: 'Checkers',
    street: '123 Main St',
    city: 'Exampleville',
    state: 'State',
    postalCode: '12345',
    country: 'Country',
    instructions: 'Please deliver to the loading dock between 9 AM and 5 PM.',
    contactName: 'Jane Smith',
    email: 'jane.smith@checkers.com',
    phone: '+1 234 567 8901'
  };

  supplierInfo = {
    companyName: 'Douglasdale',
    contactPerson: 'John Doe',
    email: 'john.doe@suppliercompany.com',
    phone: '+1 234 567 8900',
    address: '456 Supplier St, Supplier City, SC 12345, Country'
  };

  vatPercentage: number = 15; // Default VAT percentage
  deliveryDate: string = ''; // Will store the selected delivery date
  deliveryCost: number = 0; // Will store the delivery cost

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.supplierID = params['supplierID'] || '';
      this.orderID = params['orderID'] || '';
      console.log('Supplier ID:', this.supplierID);
      console.log('Order ID:', this.orderID);
      
      if (this.supplierID && this.orderID) {
        // this.loadSupplierData(this.supplierID);
        // this.loadOrderData(this.orderID);
      }
    });

    // Initialize with mock data (same as before)
    this.quoteItems = [
      {
        description: 'High-Performance Laptop',
        sku: 'TECH001',
        requestedQuantity: 10,
        isAvailable: true,
        availableQuantity: 10,
        unitCost: 150,
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
        unitCost: 200,
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
        unitCost: 500,
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
        unitCost: 100,
        totalCost: 5000,
        discount: 5,
        totalPrice: 4750
      }
    ];
    this.updateAllTotals();
    this.setDefaultDeliveryDate();
  }

  setDefaultDeliveryDate() {
    const today = new Date();
    const twoWeeksFromNow = new Date(today.setDate(today.getDate() + 14));
    this.deliveryDate = twoWeeksFromNow.toISOString().split('T')[0];
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
    this.updateTotalQuoteValue();
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

  getSubtotal(): number {
    return this.quoteItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  getVatAmount(): number {
    return this.getSubtotal() * (this.vatPercentage / 100);
  }

  getTotalQuoteValue(): number {
    return this.getSubtotal() + this.getVatAmount() + this.deliveryCost;
  }

  updateTotalQuoteValue() {
    // This method is called whenever VAT or delivery cost changes
    // The actual calculation is done in getTotalQuoteValue()
  }

  submitQuote() {
    console.log('Quote submitted:', {
      items: this.quoteItems,
      currency: this.selectedCurrency,
      vatPercentage: this.vatPercentage,
      deliveryDate: this.deliveryDate,
      deliveryCost: this.deliveryCost,
      totalValue: this.getTotalQuoteValue(),
      additionalComments: this.additionalComments,
      attachments: this.selectedFiles.map(file => file.name)
    });
    // Here you would typically send the data to a server
  }

  updateCurrency() {
    console.log('Currency updated to:', this.selectedCurrency);
    // You can add any currency conversion logic here if needed
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (this.isValidFile(file)) {
          this.selectedFiles.push(file);
        } else {
          console.warn(`File ${file.name} is not valid and was not added.`);
          // You might want to show an error message to the user here
        }
      }
    }
  }
  
  removeFile(file: File) {
    const index = this.selectedFiles.indexOf(file);
    if (index > -1) {
      this.selectedFiles.splice(index, 1);
    }
  }
  
  isValidFile(file: File): boolean {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxSize = 10 * 1024 * 1024; // 10MB
  
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  

}