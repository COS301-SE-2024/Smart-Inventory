import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

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
  quoteItems: { item: string, quantity: number }[] = [];
  selectedSuppliers: string[] = [];
  inventoryItems: string[] = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Docking Station', 'Webcam', 'Microphone', 'Speakers', 'Tablet'];
  suppliers: string[] = ['Supplier A', 'Supplier B', 'Supplier C', 'Supplier D', 'Supplier E', 'Supplier F', 'Supplier G', 'Supplier H', 'Supplier I', 'Supplier J'];

  inventoryControl = new FormControl();
  supplierControl = new FormControl();

  filteredInventoryItems: Observable<string[]>;
  filteredSuppliers: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);

  @ViewChild('supplierSelect') supplierSelect!: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<CustomQuoteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filteredInventoryItems = this.inventoryControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '', this.inventoryItems))
    );
  }

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

  private _filter(value: string, options: string[]): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  addItem() {
    this.quoteItems.push({ item: '', quantity: 1 });
  }

  removeItem(index: number) {
    this.quoteItems.splice(index, 1);
  }

  createQuote() {
    const quote = {
      items: this.quoteItems,
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
}