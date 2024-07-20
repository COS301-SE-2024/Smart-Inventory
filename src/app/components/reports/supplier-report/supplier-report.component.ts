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
    selector: 'app-supplier-report',
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
    templateUrl: './supplier-report.component.html',
    styleUrl: './supplier-report.component.css',
})
export class SupplierReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    rowData: any[] = [];

    selectedItem: any = null;
    requestQuantity: number | null = null;

    SupplierReport = {
        title: 'Order Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            metric_1: 'Average supplier performance: ',
            metric_2: 'Overall product defect rate: ',
            metric_3: 'Worst performer: ',
            metric_4: 'Average delivery rate: ',
            metric_5: 'Fill Rate: ',
            metric_6: 'Total inventory turnover: ',
            metric_7: 'Critical/Major/Minor Defect Rate:',
            metric_8: '“Right First Time” Rate:',
            metric_9: 'On-time Order Completion Rate:',
        },
        graphs: [],
    };

    tiles = [
        { icon: 'schedule', iconLabel: 'On-Time Delivery', metricName: 'On-Time Delivery Rate', value: '95%', additionalInfo: 'High reliability' },
        { icon: 'check_circle', iconLabel: 'Order Accuracy', metricName: 'Order Accuracy Rate', value: '98%', additionalInfo: 'Very accurate' },
        { icon: 'repeat', iconLabel: 'Reorder Level', metricName: 'Reorder Level', value: '50 units', additionalInfo: 'Low stock warning' },
        { icon: 'attach_money', iconLabel: 'Total Spend', metricName: 'Total Spend', value: '$25,000', additionalInfo: 'Last quarter' },
        { icon: 'money_off', iconLabel: 'Outstanding Payments', metricName: 'Outstanding Payments', value: '$5,000', additionalInfo: 'Due next month' },
        { icon: 'warning', iconLabel: 'Risk Score', metricName: 'Risk Score', value: 'Low Risk', additionalInfo: 'Stable' }
    ];

    currentIndex = 0;

    showNextTiles() {
      this.currentIndex += 3;
      if (this.currentIndex >= this.tiles.length) {
        this.currentIndex = 0;  // Wrap around to the start
      }
    }

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
            { field: 'automated', headerName: 'Automated' },
        ];
        return 'Supplier Report';
    }

    calculateAverage(column: any): number {
        const sum = this.rowData.reduce((acc, row) => acc + row[column], 0);
        return sum / this.rowData.length;
    }
    calculateTotal(column: any): number {
        const sum = this.rowData.reduce((acc, row) => acc + row[column], 0);
        return sum;
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
