import { Component, OnInit, OnDestroy } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-grid',
  standalone: true,
  imports: [AgGridModule],
  template: `
    <ag-grid-angular
      style="width: 100%; height: 400px;"
      class="ag-theme-alpine-dark custom-header"
      [rowData]="rowData"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [pagination]="true"
      [paginationPageSize]="10"
      [rowHeight]="60"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  `,
  styles: [`
    ::ng-deep .ag-theme-alpine-dark {
      --ag-background-color: #ffffff;
      --ag-odd-row-background-color:#ffffff;
      --ag-header-foreground-color: #2c3e50;
      --ag-foreground-color: #34495e;
      --ag-border-color: #bdc3c7;
      --ag-row-hover-color: #e6f2ff;
      --ag-material-accent-color: #3498db;
      --ag-font-size: 14px;
      --ag-font-family: 'Roboto', sans-serif;
    }
    ::ng-deep .custom-header {
      --ag-header-background-color: #F5F5F5;
      --ag-header-foreground-color: #2c3e50;
    }
    ::ng-deep .ag-theme-alpine-dark .ag-header {
      border-radius: 8px 8px 0 0;
    }
    ::ng-deep .ag-theme-alpine-dark .ag-header-cell {
      font-weight: bold;
    }
    ::ng-deep .ag-theme-alpine-dark .ag-cell {
      display: flex;
      align-items: center;
    }
    ::ng-deep .ag-theme-alpine-dark .ag-cell-wrapper {
      width: 100%;
    }
    ::ng-deep .status-in-stock {
      color: #2ecc71;
    }
    ::ng-deep .status-low-stock {
      color: #f39c12;
    }
    ::ng-deep .status-out-of-stock {
      color: #e74c3c;
    }
  `]
})
export class InventoryGridComponent implements OnInit, OnDestroy {
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    {
      field: 'productName',
      headerName: 'Product Name',
      cellRenderer: this.productRenderer
    },
    { field: 'sku', headerName: 'SKU' },
    { field: 'category', headerName: 'Category' },
    {
      field: 'stockStatus',
      headerName: 'Stock Status',
      cellRenderer: this.statusRenderer
    },
    { field: 'quantityOnHand', headerName: 'Quantity On Hand' },
    { field: 'reorderPoint', headerName: 'Reorder Point' },
    { field: 'unitPrice', headerName: 'Unit Price' },
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: true
  };

  rowData: any[] = [];
  private updateSubscription: Subscription | undefined;

  ngOnInit() {
    this.generateInitialData();
    this.updateSubscription = interval(150).subscribe(() => {
      this.updateRandomValues();
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
  }

  generateInitialData() {
    const products = [
      { name: 'Laptop', sku: 'TECH001', category: 'Electronics' },
      { name: 'Office Chair', sku: 'FURN002', category: 'Furniture' },
      { name: 'Printer Paper', sku: 'STAT003', category: 'Stationery' },
      { name: 'Wireless Mouse', sku: 'TECH004', category: 'Electronics' },
      { name: 'Standing Desk', sku: 'FURN005', category: 'Furniture' },
      { name: 'External Hard Drive', sku: 'TECH006', category: 'Electronics' },
      { name: 'Whiteboard Markers', sku: 'STAT007', category: 'Stationery' },
      { name: 'Ergonomic Keyboard', sku: 'TECH008', category: 'Electronics' },
      { name: 'Filing Cabinet', sku: 'FURN009', category: 'Furniture' },
      { name: 'Desk Lamp', sku: 'FURN010', category: 'Furniture' },
      { name: 'Notebook Set', sku: 'STAT011', category: 'Stationery' },
      { name: 'Wireless Headphones', sku: 'TECH012', category: 'Electronics' }
    ];

    this.rowData = products.map(product => this.generateRowData(product));
  }

  updateRandomValues() {
    if (!this.gridApi) return;

    const randomIndex = Math.floor(Math.random() * this.rowData.length);
    const updatedRow = { ...this.rowData[randomIndex], ...this.generateRandomValues() };

    // Update the specific row in the rowData array
    this.rowData[randomIndex] = updatedRow;

    // Update the specific row in the grid
    const rowNode = this.gridApi.getDisplayedRowAtIndex(randomIndex);
    if (rowNode) {
      rowNode.setData(updatedRow);
    }

    // Optionally, if you want to update multiple rows at once:
    // this.gridApi.applyTransaction({ update: [updatedRow] });
  }

  generateRowData(product: any) {
    return {
      ...product,
      productName: product.name,
      ...this.generateRandomValues()
    };
  }

  generateRandomValues() {
    const quantityOnHand = this.getRandomNumber(0, 100);
    const reorderPoint = this.getRandomNumber(10, 30);
    return {
      stockStatus: this.getStockStatus(quantityOnHand, reorderPoint),
      quantityOnHand: quantityOnHand,
      reorderPoint: reorderPoint,
      unitPrice: `£${this.getRandomNumber(20, 500)}`,
      lastRestocked: this.getRandomDate(),
      supplier: this.getRandomSupplier()
    };
  }

  getStockStatus(quantity: number, reorderPoint: number) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= reorderPoint) return 'Low Stock';
    return 'In Stock';
  }

  getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRandomDate() {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
  }

  getRandomSupplier() {
    const suppliers = ['TechSource Inc.', 'Office Supplies Co.', 'Furniture Depot', 'Electronics Warehouse'];
    return suppliers[Math.floor(Math.random() * suppliers.length)];
  }

  productRenderer(params: any) {
    return `
      <div style="display: flex; align-items: center;">
        <div>
          <div>${params.value}</div>
        </div>
      </div>
    `;
  }

  statusRenderer(params: any) {
    const statusClass = params.value.toLowerCase().replace(' ', '-');
    return `<span class="status-${statusClass}">● ${params.value}</span>`;
  }
}