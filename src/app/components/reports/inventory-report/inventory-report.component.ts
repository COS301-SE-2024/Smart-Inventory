import { TitleService } from '../../header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { SaleschartComponent } from '../../charts/saleschart/saleschart.component';
import { DynamicGraphComponent } from '../../charts/dynamic-graph/dynamic-graph.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-inventory-report',
    standalone: true,
    imports: [
        GridComponent,
        MatCardModule,
        MatGridListModule,
        MaterialModule,
        CommonModule,
        MatProgressSpinnerModule,
        SaleschartComponent,
        DynamicGraphComponent,
    ],
    templateUrl: './inventory-report.component.html',
    styleUrl: './inventory-report.component.css',
})
export class InventoryReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    rowData: any[] = [];

    selectedItem: any = null;
    requestQuantity: number | null = null;

    InventoryReport = {
        title: 'Inventory Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            metric_1: 'Total Low Stock Items: ',
            metric_2: 'Inventory Accuracy: ',
            metric_3: 'Stock to Request Ratio: ',
            metric_4: 'Total monthly requests: ',
            metric_5: 'Fulfilled requests: ',
            metric_6: 'Pending/Failed requests: ',
            metric_7: 'Backorder to time ratio: ',
            metric_8: 'Safety stock: ',
        },
        graphs: [],
    };
    ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
    }

    colDefs!: ColDef[];

    getCurrentRoute() {
        switch (this.route.snapshot.url[0].path.toString()) {
            case 'inventoryReport':
                this.colDefs = [
                    { field: 'sku', headerName: 'SKU' },
                    { field: 'category', headerName: 'Category' },
                    { field: 'description', headerName: 'Description' },
                    { field: 'quantity', headerName: 'Quantity' },
                    { field: 'requests', headerName: 'Requests' },
                ];
                return 'Inventory Report';
            case 'activityReport':
                this.colDefs = [
                    { field: 'Member ID', headerName: 'Member ID' },
                    { field: 'productId', headerName: 'Product ID' },
                    { field: 'description', headerName: 'Description' },
                    { field: 'quantity', headerName: 'Quantity' },
                    { field: 'supplier', headerName: 'Supplier' },
                ];
                return 'Activity Report';
            case 'supplierReport':
                this.colDefs = [
                    { field: 'Supplier ID', headerName: 'Supplier ID' },
                    { field: 'productId', headerName: 'Product ID' },
                    { field: 'description', headerName: 'Description' },
                    { field: 'quantity', headerName: 'Quantity' },
                    { field: 'supplier', headerName: 'Supplier' },
                ];
                return 'Supplier Report';
            default:
                return '';
        }
    }

    calculateAverage(): number {
        const sum = this.rowData.reduce((acc, row) => acc + row['price'], 0);
        return sum / this.rowData.length;
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
