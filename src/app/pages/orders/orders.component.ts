import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [GridComponent, MatButtonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {

  addButton: any = {text: 'Orders', button: true}

  // Row Data: The data to be displayed.
  rowData = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: 'Mercedes', model: 'EQA', price: 48890, electric: true },
    { make: 'Fiat', model: '500', price: 15774, electric: false },
    { make: 'Nissan', model: 'Juke', price: 20675, electric: false },
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: any[] = [
    { elementType: 'input', field: "make", headerName: 'Type', filter: 'agSetColumnFilter'},
    { elementType: 'input', field: "model", filter: 'agSetColumnFilter' },
    { elementType: 'input', field: "price", filter: 'agSetColumnFilter' },
    { elementType: 'input', field: "electric", filter: 'agSetColumnFilter' }
  ];
  
  defaultColDef: ColDef = {
    flex: 1,
  }



  openAddDialog(){

  }

}
