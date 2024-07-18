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
import { ActivatedRoute, Router } from '@angular/router';
@Component({
    selector: 'app-order-report',
    standalone: true,
    imports: [
        GridComponent,
        MatCardModule,
        MatGridListModule,
        MaterialModule,
        CommonModule,
        MatProgressSpinnerModule,
        SaleschartComponent,
    ],
    templateUrl: './order-report.component.html',
    styleUrl: './order-report.component.css',
})
export class OrderReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    rowData: any[] = [];

    selectedItem: any = null;
    requestQuantity: number | null = null;

    OrderReport = {
        title: 'Order Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            metric_1: 'Total orders: ',
            metric_2: 'Orders in progress: ',
            metric_3: 'Total orders through automation: ',
            metric_4: 'Average order time: ',
            metric_5: 'Order Frequency: ',
            metric_6: 'Order picking accuracy: ',
            metric_7: 'Rate of returns: ',
            metric_8: 'Order placement frequency: ',
            metric_9: 'Average order trips reduced: ',
            metric_10: 'Automated order frequency: ',
            metric_11: 'Perfect Order Rate: ',
        },
        graphs: [],
    };
    ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
    }

    colDefs!: ColDef[];

    getCurrentRoute() {
        this.colDefs = [
            { field: 'Order ID', headerName: 'Order ID' },
            { field: 'Order Date', headerName: 'Order Date' },
            { field: 'description', headerName: 'Description' },
            { field: 'Address', headerName: 'Address' },
            { field: 'supplier', headerName: 'Supplier' },
            { field: 'supplier', headerName: 'Supplier' },
        ];
        return 'Order Report';
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
