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
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';
import { InventoryService } from '../../../../amplify/services/inventory.service';
import { SuppliersService } from '../../../../amplify/services/suppliers.service';

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
  selector: 'app-template-quote-modal',
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
  ],
  templateUrl: './template-quote-modal.component.html',
  styleUrls: ['./template-quote-modal.component.css']
})
export class TemplateQuoteModalComponent implements OnInit {
  isLoading = true;
  quoteItems: QuoteItem[] = [];
  filteredQuoteItems: QuoteItem[] = [];
  quoteItemSearchTerm: string = '';
  selectedSuppliers: { company_name: string; supplierID: string }[] = [];
  suppliers: { company_name: string; supplierID: string }[] = [];
  inventoryItems: { sku: string; description: string }[] = [];

  supplierControl = new FormControl();
  filteredSuppliers: ReplaySubject<{ company_name: string; supplierID: string }[]> = new ReplaySubject<{ company_name: string; supplierID: string }[]>(1);

  isNewTemplate: boolean = true;
  hasUnsavedChanges: boolean = false;
  isSavingTemplate: boolean = false;

  templateId: string | null = null;

  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<TemplateQuoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private inventoryService: InventoryService,
    private suppliersService: SuppliersService
  ) {
    this.isNewTemplate = !data.templateDetails;
    this.templateId = data.templateDetails?.templateId || null;
    
    console.log('Received data in modal:', data);
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      await Promise.all([this.loadInventoryItems(), this.loadSuppliers()]);
  
      if (this.data.templateDetails) {
        this.initializeTemplateData(this.data.templateDetails);
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

  initializeTemplateData(templateDetails: any) {
    console.log('Initializing template data:', templateDetails);
  
    this.templateId = templateDetails.templateId || null;
  
    if (templateDetails.items && Array.isArray(templateDetails.items)) {
      this.quoteItems = templateDetails.items.map((item: any) => {
        const inventoryItem = this.inventoryItems.find(invItem => invItem.sku === item.ItemSKU);
        return {
          item: inventoryItem || { sku: item.ItemSKU, description: 'Unknown Item', inventoryID: '' },
          quantity: item.Quantity,
          filteredItems: new ReplaySubject<{ sku: string; description: string }[]>(1),
          searchControl: new FormControl()
        };
      });
    } else {
      console.warn('No items found in template details');
      this.quoteItems = [];
    }
  
    this.selectedSuppliers = templateDetails.suppliers && Array.isArray(templateDetails.suppliers)
      ? templateDetails.suppliers.map((supplier: any) => ({
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

  async saveTemplate() {}
  
  onQuoteChanged() {
    this.hasUnsavedChanges = true;
  }

  cancel() {
    this.dialogRef.close({ action: 'cancel' });
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