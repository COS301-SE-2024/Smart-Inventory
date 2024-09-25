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
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
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
    ],
    templateUrl: './template-quote-modal.component.html',
    styleUrls: ['./template-quote-modal.component.css'],
})
export class templateQuoteModalComponent implements OnInit {
    isLoading = true;
    quoteItems: QuoteItem[] = [];
    filteredQuoteItems: QuoteItem[] = [];
    quoteItemSearchTerm: string = '';
    selectedSuppliers: { company_name: string; supplierID: string }[] = [];
    suppliers: { company_name: string; supplierID: string }[] = [];
    inventoryItems: { sku: string; description: string }[] = [];
    selectedFrequency: string = 'Monthly';

    supplierControl = new FormControl();
    filteredSuppliers: ReplaySubject<{ company_name: string; supplierID: string }[]> = new ReplaySubject<
        { company_name: string; supplierID: string }[]
    >(1);

    isEditing: boolean = false;
    isNewQuote: boolean = false;
    hasUnsavedChanges: boolean = false;

    protected _onDestroy = new Subject<void>();

    constructor(
        public dialogRef: MatDialogRef<templateQuoteModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private inventoryService: InventoryService,
        private snackBar: MatSnackBar,
        private suppliersService: SuppliersService
    ) {
        this.isEditing = data.isEditing || false;
        this.isNewQuote = data.isNewQuote || false;

        console.log('Received data in modal:', data); // Add this log
    }

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
            this.supplierControl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
                this.filterSuppliers();
            });
        } finally {
            this.isLoading = false;
        }
    }

    initializeQuoteData(quoteDetails: any) {
        console.log('Initializing quote data:', quoteDetails); // Add this log
        if (quoteDetails.items && Array.isArray(quoteDetails.items)) {
            this.quoteItems = quoteDetails.items.map((item: any) => {
                const inventoryItem = this.inventoryItems.find((invItem) => invItem.sku === item.ItemSKU);
                return {
                    item: inventoryItem || { sku: item.ItemSKU, description: 'Unknown Item' },
                    quantity: item.Quantity,
                    filteredItems: new ReplaySubject<{ sku: string; description: string }[]>(1),
                    searchControl: new FormControl(),
                };
            });
        } else {
            console.warn('No items found in quote details');
            this.quoteItems = [];
        }

        this.selectedSuppliers =
            quoteDetails.suppliers && Array.isArray(quoteDetails.suppliers)
                ? quoteDetails.suppliers.map((supplier: any) => ({
                      company_name: supplier.company_name,
                      supplierID: supplier.supplierID,
                  }))
                : [];

        // Initialize filtered items for each quote item
        this.quoteItems.forEach((quoteItem) => {
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
            this.suppliers.filter((supplier) => supplier.company_name.toLowerCase().indexOf(search) > -1),
        );
    }

    filterItems(value: string, index: number) {
        const filterValue = value.toLowerCase();
        this.quoteItems[index].filteredItems.next(
            this.inventoryItems.filter(
                (item) =>
                    item.sku.toLowerCase().includes(filterValue) ||
                    item.description.toLowerCase().includes(filterValue),
            ),
        );
    }

    addItem() {
        const newFilteredItems = new ReplaySubject<{ sku: string; description: string }[]>(1);
        newFilteredItems.next(this.inventoryItems.slice());
        const newItem: QuoteItem = {
            item: { sku: '', description: '', inventoryID: '' },
            quantity: 1,
            filteredItems: newFilteredItems,
            searchControl: new FormControl(),
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
            this.filteredQuoteItems = this.quoteItems.filter(
                (item) =>
                    item.item.sku.toLowerCase().includes(searchTerm) ||
                    item.item.description.toLowerCase().includes(searchTerm),
            );
        }
    }

    removeSupplier(supplierToRemove: { company_name: string; supplierID: string }) {
        this.selectedSuppliers = this.selectedSuppliers.filter((s) => s.supplierID !== supplierToRemove.supplierID);
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
                  supplierID: supplier.supplierID,
                }));
                console.log('Suppliers:', this.suppliers);
              } else {
                console.error('Invalid response format for suppliers');
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
          const tenantId = await this.getTenentId(session);
    
          this.inventoryService.getInventoryItems(tenantId).subscribe(
            (inventoryItems) => {
              this.inventoryItems = inventoryItems.map((item: any) => ({
                sku: item.SKU,
                description: item.description,
                inventoryID: item.inventoryID,
              }));
    
              // Initialize filtered items for each quote item
              this.quoteItems.forEach((quoteItem) => {
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

    saveChanges() {}

    onQuoteChanged() {
        this.hasUnsavedChanges = true;
    }

    cancel() {
        this.dialogRef.close({ action: 'cancel' });
    }
}
