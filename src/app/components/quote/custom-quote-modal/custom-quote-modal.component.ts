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

import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from '../../loader/loading-spinner.component';

interface QuoteItem {
  item: { sku: string; description: string };
  quantity: number;
  filteredItems: ReplaySubject<{ sku: string; description: string }[]>;
  searchControl: FormControl;
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
  ],
  templateUrl: './custom-quote-modal.component.html',
  styleUrls: ['./custom-quote-modal.component.css']
})
export class CustomQuoteModalComponent implements OnInit {
  isLoading = true;
  quoteItems: QuoteItem[] = [];
  filteredQuoteItems: QuoteItem[] = [];
  quoteItemSearchTerm: string = '';
  selectedSuppliers: string[] = [];
  suppliers: string[] = [];
  inventoryItems: { sku: string; description: string }[] = [];

  supplierControl = new FormControl();
  filteredSuppliers: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

  isEditing: boolean = false;
  isNewQuote: boolean = false;

  protected _onDestroy = new Subject<void>();
  quoteId: string;
  constructor(
    public dialogRef: MatDialogRef<CustomQuoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {
    this.isEditing = data.isEditing || false;
    this.isNewQuote = data.isNewQuote || false;
    this.quoteId = data.quoteDetails?.quoteId;
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      await Promise.all([this.loadInventoryItems(), this.loadSuppliers()]);
  
      if (this.isEditing && this.data.quoteDetails) {
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
      this.filteredQuoteItems = this.quoteItems;
    } finally {
      this.isLoading = false;
    }
  }

  initializeQuoteData(quoteDetails: any) {
    this.quoteItems = quoteDetails.items.map((item: any) => {
      const inventoryItem = this.inventoryItems.find(invItem => invItem.sku === item.ItemSKU);
      return {
        item: inventoryItem || { sku: item.ItemSKU, description: 'Unknown Item' },
        quantity: item.Quantity,
        filteredItems: new ReplaySubject<{ sku: string; description: string }[]>(1),
        searchControl: new FormControl()
      };
    });
    this.selectedSuppliers = quoteDetails.suppliers;

    // Initialize filtered items for each quote item
    this.quoteItems.forEach(quoteItem => {
      quoteItem.filteredItems.next(this.inventoryItems.slice());
    });
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
      this.suppliers.filter(supplier => supplier.toLowerCase().indexOf(search) > -1)
    );
  }

  filterItems(value: string, index: number) {
    const filterValue = value.toLowerCase();
    this.quoteItems[index].filteredItems.next(
      this.inventoryItems.filter(item =>
        item.sku.toLowerCase().includes(filterValue) ||
        item.description.toLowerCase().includes(filterValue)
      )
    );
  }

  addItem() {
    const newFilteredItems = new ReplaySubject<{ sku: string; description: string }[]>(1);
    newFilteredItems.next(this.inventoryItems.slice());
    const newItem: QuoteItem = {
      item: { sku: '', description: '' },
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

  removeSupplier(supplier: string) {
    this.selectedSuppliers = this.selectedSuppliers.filter(s => s !== supplier);
  }

  async loadSuppliers() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getSuppliers',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        const suppliers = JSON.parse(responseBody.body);
        this.suppliers = suppliers.map((supplier: any) => supplier.company_name);
      } else {
        console.error('Error fetching suppliers data:', responseBody.body);
        this.suppliers = [];
      }
    } catch (error) {
      console.error('Error in loadSuppliers:', error);
      this.suppliers = [];
    }
  }

  async loadInventoryItems() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'Inventory-getItems',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        const inventoryItems = JSON.parse(responseBody.body);
        this.inventoryItems = inventoryItems.map((item: any) => ({
          sku: item.SKU,
          description: item.description
        }));
        // Initialize filtered items for each quote item
        this.quoteItems.forEach(quoteItem => {
          quoteItem.filteredItems.next(this.inventoryItems.slice());
        });
      } else {
        console.error('Error fetching inventory data:', responseBody.body);
        this.inventoryItems = [];
      }
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

  saveDraft() {
    const draft = {
      items: this.quoteItems.map(({ item, quantity }) => ({
        ItemSKU: item.sku,
        Quantity: quantity
      })),
      suppliers: this.selectedSuppliers,
      Quote_Status: 'Draft'
    };
    this.dialogRef.close({ action: 'saveDraft', data: draft });
  }

  saveChanges() {
    const updatedQuote = {
      quoteId: this.quoteId,
      items: this.quoteItems.map(({ item, quantity }) => ({
        ItemSKU: item.sku,
        Quantity: quantity
      })),
      suppliers: this.selectedSuppliers
    };
    this.dialogRef.close({ action: 'saveChanges', data: updatedQuote });
  }

  createQuote() {
    const quote = {
      items: this.quoteItems.map(({ item, quantity }) => ({ item, quantity })),
      suppliers: this.selectedSuppliers
    };
    this.dialogRef.close({ action: 'createQuote', data: quote });
  }

  cancel() {
    this.dialogRef.close({ action: 'cancel' });
  }

}