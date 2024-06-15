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

    // Row Data: The data to be displayed.
    rowData = [
        { Order_ID: '#101', Date: 'Model Y', Supplier: 'Amazon', Items: 10 },
        { Order_ID: '#102', Date: 'F-Series', Supplier: 'Takealot', Items: 4 },
        { Order_ID: '#104', Date: 'Corolla', Supplier: 'Gumtree', Items: 5 },
        { Order_ID: '#108', Date: 'EQA', Supplier: 'Pnp', Items: 2 },
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
