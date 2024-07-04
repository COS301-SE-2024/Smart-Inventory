import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../components/header/title.service';
import { ViewQuoteButtonRendererComponent } from './view-quote-button-renderer.component';
import { ViewReceivedQuotesButtonRendererComponent } from './view-received-quotes-button-renderer.component';
import { ActionsRendererComponent } from './actions-renderer.component';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [GridComponent, MatButtonModule, ViewQuoteButtonRendererComponent, ViewReceivedQuotesButtonRendererComponent, ActionsRendererComponent],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit{
    constructor(private titleService: TitleService) {}

    // Row Data: The data to be displayed.
    rowData = [
        {
            Order_ID: '#101',
            Order_Date: '2024-07-01',
            Order_Status: 'Pending Approval',
            Quote_ID: 'Q001',
            Quote_Status: 'Draft',
            Selected_Supplier: '',
            Expected_Delivery_Date: '',
            Actual_Delivery_Date: '',
        },
        {
            Order_ID: '#102',
            Order_Date: '2024-07-02',
            Order_Status: 'Quote Sent to Suppliers',
            Quote_ID: 'Q002',
            Quote_Status: 'Sent',
            Selected_Supplier: '',
            Expected_Delivery_Date: '',
            Actual_Delivery_Date: '',
        },
        {
            Order_ID: '#103',
            Order_Date: '2024-07-03',
            Order_Status: 'Awaiting Arrival',
            Quote_ID: 'Q003',
            Quote_Status: 'Accepted',
            Selected_Supplier: 'Takealot',
            Expected_Delivery_Date: '2024-07-10',
            Actual_Delivery_Date: '',
        },
        {
            Order_ID: '#104',
            Order_Date: '2024-07-04',
            Order_Status: 'Received',
            Quote_ID: 'Q004',
            Quote_Status: 'Accepted',
            Selected_Supplier: 'Amazon',
            Expected_Delivery_Date: '2024-07-08',
            Actual_Delivery_Date: '2024-07-07',
        },
    ];

    // Column Definitions: Defines & controls grid columns.
    colDefs: ColDef[] = [
        { field: 'Order_ID', filter: 'agSetColumnFilter' },
        { field: 'Order_Date', filter: 'agDateColumnFilter' },
        { field: 'Order_Status', filter: 'agSetColumnFilter' },
        { field: 'Quote_ID', filter: 'agSetColumnFilter' },
        { field: 'Quote_Status', filter: 'agSetColumnFilter' },
        { field: 'Selected_Supplier', filter: 'agSetColumnFilter' },
        { field: 'Expected_Delivery_Date', filter: 'agDateColumnFilter' },
        { field: 'Actual_Delivery_Date', filter: 'agDateColumnFilter' },
        {
            headerName: 'Actions',
            cellRenderer: ActionsRendererComponent,
            minWidth: 300,
        },
    ];

    frameworkComponents = {
        actionsRenderer: ActionsRendererComponent,
    };

    defaultColDef: ColDef = {
        flex: 1,
        editable: true,
    };

    openAddDialog() {}

    ngOnInit() {
        this.titleService.updateTitle('Orders');
    }
}
