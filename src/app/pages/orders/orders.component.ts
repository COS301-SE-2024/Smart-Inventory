import { Component } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../components/header/title.service';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [GridComponent, MatButtonModule],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css',
})
export class OrdersComponent {
    constructor(private titleService: TitleService) {}

    addButton: any = { text: 'Orders', button: true };

    // Row Data: The data to be displayed.
    rowData = [
        { Order_ID: 'Tesla', Date: 'Model Y', Supplier: 64950, Items: 10 },
        { Order_ID: 'Ford', Date: 'F-Series', Supplier: 33850, Items: 4 },
        { Order_ID: 'Toyota', Date: 'Corolla', Supplier: 29600, Items: 5 },
        { Order_ID: 'Mercedes', Date: 'EQA', Supplier: 48890, Items: 2 },
        { Order_ID: 'Fiat', Date: '500', Supplier: 15774, Items: 1 },
        { Order_ID: 'Nissan', Date: 'Juke', Supplier: 20675, Items: 7 },
    ];

    // Column Definitions: Defines & controls grid columns.
    colDefs: any[] = [
        { elementType: 'input', field: 'Order_ID', filter: 'agSetColumnFilter' },
        { elementType: 'input', field: 'Date', filter: 'agSetColumnFilter' },
        { elementType: 'input', field: 'Supplier', filter: 'agSetColumnFilter' },
        { elementType: 'input', field: 'Items', filter: 'agSetColumnFilter' },
    ];

    defaultColDef: ColDef = {
        flex: 1,
    };

    openAddDialog() {}

    ngOnInit() {
        this.titleService.updateTitle('Orders');
    }
}
