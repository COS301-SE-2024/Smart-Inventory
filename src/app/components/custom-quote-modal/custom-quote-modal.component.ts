import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { InventoryService } from '../../../../amplify/services/inventory.service';
import { SuppliersService } from '../../../../amplify/services/suppliers.service';
import { OrdersService } from '../../../../amplify/services/orders.service';

interface QuoteItem {
  item: { sku: string; description: string; inventoryID: string };
  quantity: number;
  filteredItems: ReplaySubject<{ sku: string; description: string }[]>;
  searchControl: FormControl;
}

interface InventoryItem {
  sku: string;
  description: string;
  inventoryID: string;
}

@Component({
  selector: 'app-custom-quote-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    NgxMatSelectSearchModule,
    LoadingSpinnerComponent,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './custom-quote-modal.component.html',
  styleUrls: ['./custom-quote-modal.component.css']
})
export class CustomQuoteModalComponent implements OnInit {
  isLoading = true;
  quoteItems: QuoteItem[] = [];
  filteredQuoteItems: QuoteItem[] = [];
  quoteItemSearchTerm: string = '';
  selectedSuppliers: { company_name: string; supplierID: string }[] = [];
  suppliers: { company_name: string; supplierID: string }[] = [];
  inventoryItems: { sku: string; description: string }[] = [];
  submissionDeadline: Date | null = null;

  supplierControl = new FormControl();
  filteredSuppliers: ReplaySubject<{ company_name: string; supplierID: string }[]> = new ReplaySubject<{ company_name: string; supplierID: string }[]>(1);

  isEditing: boolean = false;
  isNewQuote: boolean = false;
  hasUnsavedChanges: boolean = false;
  isSendingQuote: boolean = false;
  isSavingChanges: boolean = false;

  orderId: string | null = null;
  quoteId: string | null = null;
  orderDate: string | null = null;

  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<CustomQuoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private inventoryService: InventoryService,
    private suppliersService: SuppliersService,
    private ordersService: OrdersService
  ) {
    this.isEditing = data.isEditing || false;
    this.isNewQuote = data.isNewQuote || false;
    this.quoteId = data.quoteDetails?.quoteId || null;
    this.orderId = data.quoteDetails?.orderId || null;
    
    console.log('Received data in modal:', data); // Add this log
    console.log('orderId:', this.orderId, 'quoteId:', this.quoteId); // Add this log
  }

  private defaultEmailBody = `Dear {{SUPPLIER_NAME}},

  We are requesting a quote for our order. Please use the following unique link to submit your quote:
  {{WEB_FORM_URL}}
  
  Thank you for your prompt attention to this matter.
  
  Best regards`;

  async ngOnInit() {
    this.isLoading = true;
    try {
      await Promise.all([this.loadInventoryItems(), this.loadSuppliers()]);
  
      if (this.data.quoteDetails) {
        this.initializeQuoteData(this.data.quoteDetails);
      } else {
        this.addItem();
      }
  
      this.filteredSuppliers.next(this.suppliers.slice());
      this.supplierControl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterSuppliers();
        });
    } finally {
      this.isLoading = false;
    }
  }

  initializeQuoteData(quoteDetails: any) {
    console.log('Initializing quote data:', quoteDetails); // Add this log
  
    this.orderId = quoteDetails.orderId || null;
    this.quoteId = quoteDetails.quoteId || null;
    this.orderDate = quoteDetails.orderDate || null;
    this.submissionDeadline = quoteDetails.Submission_Deadline ? new Date(quoteDetails.Submission_Deadline) : null;
  
    if (quoteDetails.items && Array.isArray(quoteDetails.items)) {
      this.quoteItems = quoteDetails.items.map((item: any) => {
        const inventoryItem = this.inventoryItems.find(invItem => invItem.sku === item.ItemSKU);
        return {
          item: inventoryItem || { sku: item.ItemSKU, description: 'Unknown Item' },
          quantity: item.Quantity,
          filteredItems: new ReplaySubject<{ sku: string; description: string }[]>(1),
          searchControl: new FormControl()
        };
      });
    } else {
      console.warn('No items found in quote details');
      this.quoteItems = [];
    }
  
    this.selectedSuppliers = quoteDetails.suppliers && Array.isArray(quoteDetails.suppliers)
    ? quoteDetails.suppliers.map((supplier: any) => ({
        company_name: supplier.company_name,
        supplierID: supplier.supplierID
      }))
    : [];
  
    // Initialize filtered items for each quote item
    this.quoteItems.forEach(quoteItem => {
      quoteItem.filteredItems.next(this.inventoryItems.slice());
    });
  
    this.filteredQuoteItems = this.quoteItems;
  }


  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  private filterSuppliers() {
    if (!this.suppliers) {
      return;
    }
    let search = this.supplierControl.value;
    if (!search) {
      this.filteredSuppliers.next(this.suppliers.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSuppliers.next(
      this.suppliers.filter(supplier => supplier.company_name.toLowerCase().indexOf(search) > -1)
    );
  }

  filterItems(value: string, index: number) {
    const filterValue = value.toLowerCase();
    const filteredItems = this.inventoryItems.filter(item =>
      item.sku.toLowerCase().includes(filterValue) ||
      item.description.toLowerCase().includes(filterValue)
    );
    this.quoteItems[index].filteredItems.next(filteredItems);
  }

  addItem() {
    const newFilteredItems = new ReplaySubject<{ sku: string; description: string }[]>(1);
    newFilteredItems.next(this.inventoryItems.slice());
    const newItem: QuoteItem = {
      item: { sku: '', description: '', inventoryID: '' },
      quantity: 1,
      filteredItems: newFilteredItems,
      searchControl: new FormControl()
    };
    this.quoteItems.push(newItem);
    this.filterQuoteItems();
  }

  removeItem(index: number) {
    this.quoteItems.splice(index, 1);
    this.filterQuoteItems();
  }

  filterQuoteItems() {
    if (!this.quoteItemSearchTerm) {
      this.filteredQuoteItems = this.quoteItems;
    } else {
      const searchTerm = this.quoteItemSearchTerm.toLowerCase();
      this.filteredQuoteItems = this.quoteItems.filter(item =>
        item.item.sku.toLowerCase().includes(searchTerm) ||
        item.item.description.toLowerCase().includes(searchTerm)
      );
    }
  }

  removeSupplier(supplierToRemove: { company_name: string; supplierID: string }) {
    this.selectedSuppliers = this.selectedSuppliers.filter(s => s.supplierID !== supplierToRemove.supplierID);
    this.onQuoteChanged();
  }

  async loadSuppliers() {
    try {
      const session = await fetchAuthSession();
      const tenantId = await this.getTenentId(session);
  
      this.suppliersService.getSuppliers(tenantId).subscribe(
        (response: any) => {
          if (response && Array.isArray(response)) {
            this.suppliers = response.map((supplier: any) => ({
              company_name: supplier.company_name,
              supplierID: supplier.supplierID
            }));
            console.log('Suppliers:', this.suppliers);
          } else {
            console.error('Invalid response format for suppliers data');
            this.suppliers = [];
          }
        },
        (error) => {
          console.error('Error fetching suppliers data:', error);
          this.suppliers = [];
        }
      );
    } catch (error) {
      console.error('Error in loadSuppliers:', error);
      this.suppliers = [];
    }
  }

  async loadInventoryItems() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      this.inventoryService.getInventoryItems(tenentId).subscribe(
        (inventoryItems) => {
          const uniqueItems = this.filterDuplicateSKUs(inventoryItems.map((item: any) => ({
            sku: item.SKU,
            description: item.description,
            inventoryID: item.inventoryID
          })));
          this.inventoryItems = uniqueItems;
          // Initialize filtered items for each quote item
          this.quoteItems.forEach(quoteItem => {
            quoteItem.filteredItems.next(this.inventoryItems.slice());
          });
        },
        (error) => {
          console.error('Error fetching inventory data:', error);
          this.inventoryItems = [];
        }
      );
    } catch (error) {
      console.error('Error in loadInventoryItems:', error);
      this.inventoryItems = [];
    }
  }

  async getTenentId(session: any): Promise<string> {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
      credentials: session.credentials,
    });

    const getUserCommand = new GetUserCommand({
      AccessToken: session.tokens?.accessToken.toString(),
    });
    const getUserResponse = await cognitoClient.send(getUserCommand);

    const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

    if (!tenentId) {
      throw new Error('TenentId not found in user attributes');
    }

    return tenentId;
  }

  compareItems(item1: any, item2: any): boolean {
    return item1 && item2 ? item1.sku === item2.sku : item1 === item2;
  }


  async saveChanges() {
    this.isSavingChanges = true;
    const updatedQuote = {
      quoteId: this.quoteId,
      orderId: this.orderId,
      orderDate: this.orderDate,
      items: this.quoteItems.map(({ item, quantity }) => ({
        ItemSKU: item.sku,
        Quantity: quantity,
        inventoryID: item.inventoryID
      })),
      suppliers: this.selectedSuppliers.map(supplier => ({
        company_name: supplier.company_name,
        supplierID: supplier.supplierID
      })),
      Submission_Deadline: this.submissionDeadline ? this.submissionDeadline.toISOString() : null
    };
  
    console.log('Saving changes with data:', JSON.stringify(updatedQuote, null, 2));
  
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);
  
      if (!updatedQuote.quoteId) {
        throw new Error('Quote ID is missing');
      }
  
      const response = await this.ordersService.updateQuoteDetails(tenentId, updatedQuote.quoteId, updatedQuote).toPromise();
  
      console.log('API response:', JSON.stringify(response, null, 2));
  
      if (response && response.message === 'Quote updated successfully') {
        console.log('Quote updated successfully');
        this.hasUnsavedChanges = false;
        this.snackBar.open('Changes saved successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } else {
        throw new Error(response.error || 'Failed to update quote');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      this.snackBar.open(`Error saving changes: ${(error as Error).message}`, 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    } finally {
      this.isSavingChanges = false;
    }
  }

  onQuoteChanged() {
    this.hasUnsavedChanges = true;
  }

  createOrder() {
    const order = {
      items: this.quoteItems.map(({ item, quantity }) => ({
        ItemSKU: item.sku,
        Quantity: quantity,
        inventoryID: item.inventoryID
      })),
      suppliers: this.selectedSuppliers.map(supplier => ({
        company_name: supplier.company_name,
        supplierID: supplier.supplierID
      })),
      Quote_Status: 'Draft',
      Submission_Deadline: this.submissionDeadline ? this.submissionDeadline.toISOString() : null
    };
    console.log(order);
    this.dialogRef.close({ action: 'createOrder', data: order });
  }

  cancel() {
    this.dialogRef.close({ action: 'cancel' });
  }
  

  async sendQuote() {
    if (this.hasUnsavedChanges) {
      this.snackBar.open('Please save changes before sending the quote.', 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }
    if (!this.isNewQuote) {
      this.isSendingQuote = true; // Set loading state to true
      try {
        console.log('Sending quote...');
        const emailData = await this.prepareEmailData();
        
        // Send emails
        await this.sendEmails(emailData);

        this.dialogRef.close({ action: 'sendQuote', data: {
          quoteId: this.quoteId,
          items: this.quoteItems,
          suppliers: this.selectedSuppliers,
          emailData: emailData
        }});
      } catch (error) {
        console.error('Error sending quote:', error);
        this.snackBar.open('Error sending quote. Please try again.', 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      } finally {
        this.isSendingQuote = false; // Set loading state back to false
      }
    }

  }

  async prepareEmailData() {
    const session = await fetchAuthSession();
    const tenentId = await this.getTenentId(session);
    const deliveryInfoID = await this.getDeliveryInfoID(tenentId);
    const emailTemplate = await this.getEmailTemplate(tenentId);

    const emailDataPromises = this.selectedSuppliers.map(async (supplier) => {
      const supplierDetails = await this.getSupplierDetails(tenentId, supplier.supplierID);
      const uniqueLink = `https://main.d20fi26o9migpb.amplifyapp.com/supplier-form/${supplier.supplierID}/${this.quoteId}/${deliveryInfoID}/${tenentId}`;
      
      let emailBody = emailTemplate || this.defaultEmailBody;
      emailBody = emailBody.replace('{{SUPPLIER_NAME}}', supplier.company_name)
                           .replace('{{WEB_FORM_URL}}', uniqueLink);

      return {
        supplierEmail: supplierDetails.contact_email,
        supplierName: supplier.company_name,
        emailBody: emailBody,
        orderId: this.orderId, // Include the order ID in the email data
        quoteId: this.quoteId // Include the quote ID as well for completeness
      };
    });

    const emailData = await Promise.all(emailDataPromises);
    console.log('Email data:', emailData);
    return emailData;
  }

  async getEmailTemplate(tenentId: string): Promise<string | null> {
    try {
      const response = await this.ordersService.getEmailTemplate(tenentId).toPromise();
      
      if (response && response.emailBody) {
        return response.emailBody;
      } else {
        console.log('No custom email template found for this tenant. Using default template.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching email template:', error);
      return null;
    }
  }


  async sendEmails(emailData: any[]) {
    try {
      const response = await this.ordersService.sendSupplierEmails(emailData).toPromise();
      console.log('Emails sent successfully:', response);
      // Handle success (e.g., show a success message)
    } catch (error) {
      console.error('Failed to send emails:', error);
      // Handle error (e.g., show an error message)
    }
  }



  async getSupplierDetails(tenentId: string, supplierID: string): Promise<any> {
    try {
      const supplierDetails = await this.suppliersService.getSupplierDetails(tenentId, supplierID).toPromise();
      return supplierDetails;
    } catch (error: unknown) {
      console.error('Error getting supplier details:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get supplier details: ${error.message}`);
      } else {
        throw new Error('Failed to get supplier details: Unknown error');
      }
    }
  }

  async getDeliveryInfoID(tenentId: string): Promise<string> {
    try {
      const response = await this.ordersService.getDeliveryID(tenentId).toPromise();
      if (response && response.deliveryInfoID) {
        return response.deliveryInfoID;
      } else {
        throw new Error('DeliveryInfoID not found in response');
      }
    } catch (error) {
      console.error('Error fetching deliveryInfoID:', error);
      throw new Error('Failed to get deliveryInfoID');
    }
  }

  private filterDuplicateSKUs(items: InventoryItem[]): InventoryItem[] {
    const uniqueItems = new Map<string, InventoryItem>();
    items.forEach(item => {
      if (!uniqueItems.has(item.sku)) {
        uniqueItems.set(item.sku, item);
      }
    });
    return Array.from(uniqueItems.values());
  }

}