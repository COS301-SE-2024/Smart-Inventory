import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from './custom-currency.pipe';
import { MatDialog } from '@angular/material/dialog';
import { UpdateContactConfirmationComponent } from './update-contact-confirmation.component';
import { ActivatedRoute } from '@angular/router';
import { SupplierService } from '../../../../amplify/services/supplier.service';
import { DeliveryService } from '../../../../amplify/services/delivery.service';
import { QuoteService } from '../../../../amplify/services/quote-items.service';
import { QuoteSubmissionService } from '../../../../amplify/services/quote-submission.service';

interface QuoteItem {
  upc: string;
  description: string;
  sku: string;
  requestedQuantity: number;
  isAvailable: boolean;
  availableQuantity: number;
  unitCost: number;
  totalCost: number;
  discount: number;
  totalPrice: number;
  inventoryID: string;
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
  quoteID: string = '';
  deliveryID: string = '';
  tenentId: string = '';


  constructor(private dialog: MatDialog, private route: ActivatedRoute, private supplierService: SupplierService, private deliveryService: DeliveryService, private quoteService: QuoteService, private quoteSubmissionService: QuoteSubmissionService ) {}

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
    company: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    instructions: '',
    contactName: '',
    email: '',
    phone: ''
  };

  supplierInfo = {
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: ''
  };

  vatPercentage: number = 15; // Default VAT percentage
  deliveryDate: string = ''; // Will store the selected delivery date
  deliveryCost: number = 0; // Will store the delivery cost

  ngOnInit() {

    this.route.params.subscribe(params => {
      this.supplierID = params['supplierID'] || '';
      this.quoteID = params['quoteID'] || '';
      this.deliveryID = params['deliveryID'] || '';
      this.tenentId = params['tenentId'] || '';
      console.log('Supplier ID:', this.supplierID);
      console.log('Quote ID:', this.quoteID);
      console.log('Delivery ID:', this.deliveryID);
      console.log('Tenent ID:', this.tenentId);
      
      if (this.supplierID && this.tenentId) {
        this.loadSupplierData();
      }
      if (this.deliveryID && this.tenentId) {
        this.loadDeliveryInfo();
      }
      if (this.quoteID && this.tenentId) {
        this.loadQuoteItems();
      }


    });

    this.quoteItems = [];
    this.updateAllTotals();
    this.setDefaultDeliveryDate();
  }

  loadSupplierData() {
    this.supplierService.getSupplierInfo(this.tenentId, this.supplierID).subscribe(
      (data) => {
        console.log('Received supplier data:', data);
        this.supplierInfo = {
          companyName: data.company_name,
          contactPerson: data.contact_name,
          email: data.contact_email,
          phone: data.phone_number,
          address: `${data.address.street}, ${data.address.city}, ${data.address.state_province}, ${data.address.postal_code}, ${data.address.country}`
        };
        console.log('Updated supplierInfo:', this.supplierInfo);
      },
      (error) => {
        console.error('Error fetching supplier data:', error);
        // Handle error (e.g., show error message to user)
      }
    );
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
    const quoteData = {
      quoteItems: this.quoteItems.map(item => ({
        upc: item.upc,
        sku: item.sku,
        unitCost: item.unitCost,
        availableQuantity: item.availableQuantity,
        totalPrice: item.totalPrice,
        discount: item.discount,
        inventoryID: item.inventoryID,
        isAvailable: item.isAvailable,

      })),
      quoteDetails: {
        QuoteID: this.quoteID,
        SupplierID: this.supplierID,
        vatPercentage: this.vatPercentage,
        vatAmount: this.getVatAmount(),
        deliveryDate: this.deliveryDate,
        deliveryCost: this.deliveryCost,
        subtotal: this.getSubtotal(),
        totalQuoteValue: this.getTotalQuoteValue(),
        currency: this.selectedCurrency,
        additionalComments: this.additionalComments,
        tenentId: this.tenentId
      }
    };

    this.quoteSubmissionService.submitQuote(quoteData).subscribe(
      (response) => {
        console.log('Quote submitted successfully:', response);
        // Handle successful submission (e.g., show success message, navigate to a different page)
      },
      (error) => {
        console.error('Error submitting quote:', error);
        // Handle error (e.g., show error message to user)
      }
    );
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

  loadDeliveryInfo() {
    if (this.tenentId && this.deliveryID) {
      this.deliveryService.getDeliveryInfo(this.tenentId, this.deliveryID).subscribe(
        (data) => {
          console.log('Received delivery data:', data);
          this.deliveryAddress = {
            company: data.companyName,
            street: data.street,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            instructions: data.deliveryInstructions,
            contactName: data.contactName,
            email: data.email,
            phone: data.phone
          };
          console.log('Updated deliveryAddress:', this.deliveryAddress);
        },
        (error) => {
          console.error('Error fetching delivery data:', error);
          // Handle error (e.g., show error message to user)
        }
      );
    }
  }

  loadQuoteItems() {
    this.quoteService.getQuoteItems(this.quoteID, this.tenentId).subscribe(
      (items) => {
        this.quoteItems = items;
        this.updateAllTotals();
      },
      (error) => {
        console.error('Error fetching quote items:', error);
        // Handle error (e.g., show error message to user)
      }
    );
  }

  

}