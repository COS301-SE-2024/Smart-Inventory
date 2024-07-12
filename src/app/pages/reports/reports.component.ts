import { TitleService } from '../../components/header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../components/material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { InventoryReportComponent } from '../../components/reports/inventory-report/inventory-report.component';
import { Router } from '@angular/router';
@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [
        MatCardModule,
        MatGridListModule,
        MaterialModule,
        CommonModule,
        MatProgressSpinnerModule,
        InventoryReportComponent,
    ],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
    ) {}

    reports = {
        InventoryReport: {
            title: 'Inventory Report',
            subtitle:
                'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
            metric_1: 'Total Low Stock Items: ',
            metric_2: 'Inventory Accuracy: ',
            metric_3: 'Stock to Request Ratio: ',
            metric_4: 'Total monthly requests: ',
            metric_5: 'Fulfilled requests: ',
            metric_6: 'Pending/Failed requests: ',
            metric_7: 'Backorder to time ratio: ',
            metric_8: 'Safety stock: ',
            graphs: [],
        },
        ActivityReport: {
            title: 'Activity Report',
            subtitle:
                'Have an overall view of the team, their performance, activities and analytics associated with it making team management easier.',
            metric_1: 'Average completed activities: ',
            metric_2: 'Idle users: ',
            metric_3: 'Average time to complete a task: ',
            graphs: [],
        },
        OrderReport: {
            title: 'Order Report',
            subtitle:
                'Have an overall view of the orders, the quality, time it takes and analytics associated with it.',
            metric_1: 'Total orders: ',
            metric_2: 'Order placement frequency: ',
            metric_3: 'Order picking accuracy: ',
            metric_4: 'Total amount of automated orders: ',
            metric_5: 'Average order trips reduced: ',
            metric_6: 'Automated order frequency: ',
            graphs: [],
        },
        SupplierReport: {
            title: 'Supplier Report',
            subtitle:
                'Have an overall view of the suppliers, their activities, how well they performed and analytics associated with them.',
            metric_1: 'Average supplier performance: ',
            metric_2: 'Overall product defect rate: ',
            metric_3: 'Worst performer: ',
            graphs: [],
        },
    };

    viewFullReport(report: string) {
        switch (report) {
            case 'InventoryReport':
                this.router.navigate(['/inventoryReport']);
                break;
            case 'ActivityReport':
                this.router.navigate(['/activityReport']);
                break;
            case 'OrderReport':
                this.router.navigate(['/orderReport']);
                break;
            case 'SupplierReport':
                this.router.navigate(['/supplierReport']);
                break;
            default:
                console.warn(`Unknown report type: ${report}`);
        }
    }

    ngOnInit() {
        this.titleService.updateTitle('Reports');
    }
}
