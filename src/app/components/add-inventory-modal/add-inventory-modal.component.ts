import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
    selector: 'app-add-inventory-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        NgxMatSelectSearchModule,
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './add-inventory-modal.component.html',
    styleUrls: ['./add-inventory-modal.component.css'],
})
export class AddInventoryModalComponent implements OnInit, OnDestroy {
    inventoryForm: FormGroup;
    categories: string[] = [
        'Food: Perishable',
        'Food: Non-Perishable',
        'Beverages: Alcoholic',
        'Beverages: Non-Alcoholic',
        'Cleaning Supplies',
        'Kitchen Equipment',
        'Utensils and Tableware',
        'Office Supplies',
        'Packaging Materials',
        'Paper Goods',
    ];
    showFullForm = false;
    itemExists = false;

    supplierControl = new FormControl();
    filteredSuppliers: ReplaySubject<{ company_name: string; supplierID: string }[]> = new ReplaySubject<{ company_name: string; supplierID: string }[]>(1);

    protected _onDestroy = new Subject<void>();

    constructor(
        public dialogRef: MatDialogRef<AddInventoryModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { suppliers: any[], tenentId: string },
        private fb: FormBuilder,
    ) {
        this.inventoryForm = this.fb.group({
            upc: [{value: '', disabled: true}, Validators.required],
            sku: ['', Validators.required],
            description: [{value: '', disabled: true}, Validators.required],
            category: [{value: '', disabled: true}, Validators.required],
            quantity: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
            lowStockThreshold: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
            reorderAmount: [{value: 0, disabled: true}, [Validators.required, Validators.min(0)]],
            supplier: [{value: '', disabled: true}, Validators.required],
            expirationDate: [{value: '', disabled: true}, Validators.required],
        });
    }

    ngOnInit() {
        // Set initial filtered suppliers
        this.filteredSuppliers.next(this.data.suppliers.slice());

        // Listen for supplier search field value changes
        this.supplierControl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterSuppliers();
            });
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    private filterSuppliers() {
        if (!this.data.suppliers) {
            return;
        }
        let search = this.supplierControl.value;
        if (!search) {
            this.filteredSuppliers.next(this.data.suppliers.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        this.filteredSuppliers.next(
            this.data.suppliers.filter(supplier => supplier.company_name.toLowerCase().indexOf(search) > -1)
        );
    }

    async onNext() {
        const sku = this.inventoryForm.get('sku')?.value;
        if (sku) {
            const existingItem = await this.checkExistingItem(sku);
            if (existingItem) {
                this.itemExists = true;
                this.populateForm(existingItem);
            } else {
                this.itemExists = false;
                this.enableAllControls();
            }
            this.showFullForm = true;
        }
    }

    async checkExistingItem(sku: string) {
        try {
            const session = await fetchAuthSession();
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                tenentId: this.data.tenentId,
                sku: sku
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'inventorySummary-getItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                return JSON.parse(responseBody.body);
            }
        } catch (error) {
            console.error('Error checking existing item:', error);
        }
        return null;
    }

    populateForm(item: any) {
        this.inventoryForm.patchValue({
            sku: item.SKU,
            description: item.description,
            category: item.category,
            lowStockThreshold: item.lowStockThreshold,
            reorderAmount: item.reorderAmount,
            supplier: item.supplier,
            upc: item.upc
        });

        // Enable only certain fields
        this.inventoryForm.get('quantity')?.enable();
        this.inventoryForm.get('supplier')?.enable();
        this.inventoryForm.get('expirationDate')?.enable();
    }

    enableAllControls() {
        Object.keys(this.inventoryForm.controls).forEach(key => {
            this.inventoryForm.get(key)?.enable();
        });
    }

    onSave() {
        if (this.inventoryForm.valid) {
            // Use getRawValue() to include disabled fields
            const formData = this.inventoryForm.getRawValue();
            
            // If it's an existing item, we want to keep the original values for certain fields
            if (this.itemExists) {
                // Only update the editable fields
                const updatedData = {
                    sku: formData.sku,
                    quantity: formData.quantity,
                    supplier: formData.supplier,
                    expirationDate: formData.expirationDate,
                    // Include other fields that should not be changed
                    upc: formData.upc,
                    description: formData.description,
                    category: formData.category,
                    lowStockThreshold: formData.lowStockThreshold,
                    reorderAmount: formData.reorderAmount
                };
                this.dialogRef.close(updatedData);
            } else {
                // For new items, we can send all the form data
                this.dialogRef.close(formData);
            }
        }
    }

    onCancel() {
        this.dialogRef.close();
    }

    generateSKU() {
        // Generate a random SKU
        const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
        const timestamp = new Date().getTime().toString().slice(-4);
        const newSKU = `SKU-${randomPart}-${timestamp}`;
        
        // Update the form control
        this.inventoryForm.get('sku')?.setValue(newSKU);
    }
}