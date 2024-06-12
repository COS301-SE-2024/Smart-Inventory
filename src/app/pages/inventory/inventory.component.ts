import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [GridComponent, MatButtonModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent {

  addButton: any = {text: 'Add Items', button: true}
  removeButton: any = {text: 'Remove Items', button: true}

  // Row Data: The data to be displayed.
  rowData = [
    { sku: "EX123", productId: "6a9c12a1-22fc-465d...", description: "TV-monitor", quantity: 50, supplier: "Amazon" },
    { sku: "EX456", productId: "2b8f56c3-91bd-412e...", description: "Wireless Keyboard", quantity: 75, supplier: "Logitech" },
    { sku: "EX789", productId: "9d4e63f8-5a2c-438f...", description: "Gaming Mouse", quantity: 100, supplier: "Razer" },
    { sku: "EX321", productId: "7c6d41e9-3f8b-492a...", description: "Laptop", quantity: 25, supplier: "Dell" },
    { sku: "EX654", productId: "1a5b92d7-8c4e-411d...", description: "Headphones", quantity: 60, supplier: "Bose" }
  ];

  // Column Definitions: Defines & controls grid columns. 
  colDefs: any[] = [
    { elementType: 'checkbox', field: "checkbox", checkboxSelection: true },
    { elementType: 'input', field: "sku" },
    { elementType: 'input', field: "productId" },
    { elementType: 'input', field: "description" },
    { elementType: 'input', field: "quantity" },
    { elementType: 'input', field: "supplier" },
    { elementType: 'button', field: "addColumn", cellRenderer: this.addColumnRenderer }
  ];

  defaultColDef: ColDef = {
    flex: 1,
  }

  addColumnRenderer() {
    // Render add column button
  }

  openAddItemsDialog(){
    // Open dialog to add new inventory items  
  }
  
  openRemoveItemsDialog(){
    // Open dialog to remove selected inventory items
  }

}