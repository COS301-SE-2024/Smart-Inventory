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
                'The Inventory Report provides a holistic view of your inventory status, movements, and forecasts. By leveraging advanced analytics and predictive modeling, this powerful tool offers actionable insights to optimize inventory levels, automate ordering processes, and enhance overall supply chain efficiency.',
        },
        ActivityReport: {
            title: 'Activity Report',
            subtitle:
                "The Team Activity Report provides a holistic view of your team's performance, activities, and associated analytics. This powerful tool streamlines team management by offering actionable insights through intuitive visualizations and detailed metrics.",
        },
        OrderReport: {
            title: 'Order Report',
            subtitle:
                'The Order Report provides a holistic view of your ordering system, encompassing both manual and automated orders. This powerful tool offers insights into order quality, processing times, and associated analytics, enabling data-driven decisions to optimize your order fulfillment process.',
        },
        SupplierReport: {
            title: 'Supplier Report',
            subtitle:
                'The Supplier Report provides a holistic view of your supplier network, their activities, performance metrics, and associated analytics. This powerful tool offers insights into supplier reliability, quality, cost-effectiveness, and overall impact on your supply chain, enabling data-driven decisions to optimize supplier relationships and procurement strategies.',
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
