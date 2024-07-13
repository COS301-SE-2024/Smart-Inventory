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

interface QuoteItem {
  item: string;
  quantity: number;
  filteredItems: ReplaySubject<string[]>;
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
    NgxMatSelectSearchModule
  ],
  templateUrl: './custom-quote-modal.component.html',
  styleUrls: ['./custom-quote-modal.component.css']
})
export class CustomQuoteModalComponent implements OnInit {
  quoteItems: QuoteItem[] = [];
  filteredQuoteItems: QuoteItem[] = [];
  quoteItemSearchTerm: string = '';
  selectedSuppliers: string[] = [];
  suppliers: string[] = [];
  inventoryItems: string[] = [];

  supplierControl = new FormControl();
  filteredSuppliers: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<CustomQuoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.addItem();
    await this.loadSuppliers();
    await this.loadInventoryItems();
    this.filteredSuppliers.next(this.suppliers.slice());
    this.supplierControl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterSuppliers();
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
      this.suppliers.filter(supplier => supplier.toLowerCase().indexOf(search) > -1)
    );
  }
  
  filterItems(value: string, index: number) {
    const filterValue = value.toLowerCase();
    this.quoteItems[index].filteredItems.next(
      this.inventoryItems.filter(item => item.toLowerCase().includes(filterValue))
    );
  }

  addItem() {
    const newFilteredItems = new ReplaySubject<string[]>(1);
    newFilteredItems.next(this.inventoryItems.slice());
    const newItem = { 
      item: '', 
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
        item.item.toLowerCase().includes(searchTerm)
      );
    }
  }

  createQuote() {
    const quote = {
      items: this.quoteItems.map(({ item, quantity }) => ({ item, quantity })),
      suppliers: this.selectedSuppliers
    };
    this.dialogRef.close(quote);
  }

  cancel() {
    this.dialogRef.close();
  }

  removeSupplier(supplier: string) {
    this.selectedSuppliers = this.selectedSuppliers.filter(s => s !== supplier);
  }

  saveDraft() {
    const draft = {
      items: this.quoteItems.map(({ item, quantity }) => ({ item, quantity })),
      suppliers: this.selectedSuppliers
    };
    // Here you would typically save the draft to a service or local storage
    console.log('Saving draft:', draft);
    // Optionally, you can show a snackbar or some other notification to the user
    this.snackBar.open('Draft saved successfully', 'Close', { duration: 3000 });
    this.dialogRef.close();
  }

  async loadSuppliers() {
    try {
      const session = await fetchAuthSession();
      const tenantId = await this.getTenantId(session);
  
      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });
  
      const invokeCommand = new InvokeCommand({
        FunctionName: 'getSuppliers',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
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
      const tenantId = await this.getTenantId(session);
  
      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });
  
      const invokeCommand = new InvokeCommand({
        FunctionName: 'Inventory-getItems',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
      });
  
      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
      if (responseBody.statusCode === 200) {
        const inventoryItems = JSON.parse(responseBody.body);
        this.inventoryItems = inventoryItems.map((item: any) => item.SKU);
      } else {
        console.error('Error fetching inventory data:', responseBody.body);
        this.inventoryItems = [];
      }
    } catch (error) {
      console.error('Error in loadInventoryItems:', error);
      this.inventoryItems = [];
    }
  }
  
  async getTenantId(session: any): Promise<string> {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
      credentials: session.credentials,
    });
  
    const getUserCommand = new GetUserCommand({
      AccessToken: session.tokens?.accessToken.toString(),
    });
    const getUserResponse = await cognitoClient.send(getUserCommand);
  
    const tenantId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;
  
    if (!tenantId) {
      throw new Error('TenantId not found in user attributes');
    }
  
    return tenantId;
  }
}