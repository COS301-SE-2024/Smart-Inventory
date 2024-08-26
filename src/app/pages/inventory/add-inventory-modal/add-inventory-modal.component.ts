import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

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
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './add-inventory-modal.component.html',
    styleUrls: ['./add-inventory-modal.component.css'],
})
export class AddInventoryModalComponent {
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

    constructor(
        public dialogRef: MatDialogRef<AddInventoryModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { suppliers: any[] },
        private fb: FormBuilder,
    ) {
        this.inventoryForm = this.fb.group({
            generate: [true, Validators.required],
            upc: ['', Validators.required],
            sku: ['', Validators.required],
            description: ['', Validators.required],
            category: ['', Validators.required],
            quantity: [0, [Validators.required, Validators.min(0)]],
            lowStockThreshold: [0, [Validators.required, Validators.min(0)]],
            reorderAmount: [0, [Validators.required, Validators.min(0)]],
            supplier: ['', Validators.required],
            expirationDate: ['', Validators.required],
        });
    }

    onSave() {
        if (this.inventoryForm.valid) {
            this.dialogRef.close(this.inventoryForm.value);
        }
    }

    onCancel() {
        this.dialogRef.close();
    }

    generateSKU() {
        this.inventoryForm.get('sku')?.setValue('test');
    }
}
