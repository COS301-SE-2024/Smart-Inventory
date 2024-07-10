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
  selectedSuppliers: string[] = [];
  inventoryItems: string[] = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Docking Station', 'Webcam', 'Microphone', 'Speakers', 'Tablet'];
  suppliers: string[] = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E', 'Supplier F', 'Supplier G', 'Supplier H', 'Supplier I', 'Supplier J'];

  supplierControl = new FormControl();
  filteredSuppliers: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<CustomQuoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.addItem();
    this.filteredSuppliers.next(this.suppliers.slice());
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
    this.quoteItems.push({ 
      item: '', 
      quantity: 1, 
      filteredItems: newFilteredItems,
      searchControl: new FormControl()
    });
  }

  removeItem(index: number) {
    this.quoteItems.splice(index, 1);
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
}