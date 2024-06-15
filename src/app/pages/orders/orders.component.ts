import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../components/header/title.service';
import { NumericCellEditor } from '../../components/grid/row-button/numericCellEditor.component';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [GridComponent, MatButtonModule, NumericCellEditor],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css',
})
export class OrdersComponent {
    constructor(private titleService: TitleService) {}

    // Row Data: The data to be displayed.
    rowData = [
        { Order_ID: '#101', Date: '01/01/2002', Supplier: 'Amazon', Items: 10 },
        { Order_ID: '#102', Date: '01/01/2002', Supplier: 'Takealot', Items: 4 },
        { Order_ID: '#104', Date: '01/01/2002', Supplier: 'Gumtree', Items: 5 },
        { Order_ID: '#108', Date: '01/01/2002', Supplier: 'Pnp', Items: 2 },
    ];

    // Column Definitions: Defines & controls grid columns.
    colDefs: any[] = [
        { field: 'Order_ID', filter: 'agSetColumnFilter', editable: true },
        { field: 'Date', filter: 'agSetColumnFilter', editable: true },
        { field: 'Supplier', filter: 'agSetColumnFilter', editable: true },
        { field: 'Items', filter: 'agSetColumnFilter', editable: true },
    ];

    defaultColDef: ColDef = {
        flex: 1,
        editable: true,
    };

    openAddDialog() {}

    ngOnInit() {
        this.titleService.updateTitle('Orders');
    }
}
