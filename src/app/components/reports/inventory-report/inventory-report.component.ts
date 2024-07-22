import { TitleService } from '../../header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartDataService } from '../../../services/chart-data.service';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';

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
        AgChartsAngular,
    ],
    templateUrl: './inventory-report.component.html',
    styleUrl: './inventory-report.component.css',
})
export class InventoryReportComponent implements OnInit {
    category: string[] = ['veg', 'meat', 'nuts'];
    colDefs!: ColDef[];
    rowData: any[] = [];
    selectedItem: any = null;
    requestQuantity: number | null = null;
    sum: number = 0;
    quantity: number = 0;
    requests: number = 0;
    count: number = 0;
    InventoryReport: any;
    options1!: AgChartOptions;
    options2!: AgChartOptions;
    options3!: AgChartOptions;
    options4!: AgChartOptions;
    options5!: AgChartOptions;
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
        public service: ChartDataService,
    ) {
        this.titleService.updateTitle(this.getCurrentRoute());
    }

    ngOnInit() {
        this.options1 = this.service.setPieData(this.calculateCategoryTotalQuantities(), 'Quantity per Category');
        this.options2 = this.service.setPieData(this.calculateCategoryTotalRequests(), 'Requests per Category');
        this.options3 = this.service.setBarData(
            this.calculateCategoryTotalQuantities(),
            this.calculateCategoryTotalRequests(),
            this.calculateCategoryTotalRequestsQuantity(),
            'Requests Vs Quantity per Category',
        );
        this.options4 = this.service.setPieData(
            this.calculateCategoryTotalRequests(),
            'Requests Quantity per Category',
        );
        this.options5 = this.service.setAreaData(
            'Yearly correlation between requests, quantity of requests and stock level',
        );
        this.InventoryReport = {
            title: 'Inventory Report',
            subtitle:
                'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
            metrics: {
                metric_1: 'Total Stock Items: ' + this.calculateTotal('quantity'),
                metric_2: 'Total Requests: ' + this.calculateTotal('requests'),
                metric_3: 'Total Stock Quantity Requested: ' + this.calculateTotal('requestsQuantity'),
                metric_4: 'Total Low Stock Items: ' + this.calculateTotalEmpty(),
                metric_5: 'Inventory Accuracy: ' + this.calculateAccuracy() + '%',
                metric_6: 'Stock to Request Ratio: ' + this.calculateRatio(),
                metric_7: 'Fulfilled requests: ',
                metric_8: 'Pending/Failed requests: ',
                metric_9: 'Service Level: ',
                metric_10: 'Accuracy of Forecast Demand: ',
                metric_11: 'Inventory Shrinkage: ',
                metric_12: 'Deadstock(due to expiration):',
                metric_13: ' Lost Sales Ratio: ',
            },
            graphs: [],
        };
    }

    getCurrentRoute() {
        this.colDefs = [
            { field: 'sku', headerName: 'SKU' },
            { field: 'category', headerName: 'Category' },
            { field: 'description', headerName: 'Description' },
            { field: 'quantity', headerName: 'Quantity' },
            { field: 'requests', headerName: 'Requests' },
            { field: 'requestsQuantity', headerName: 'Requests Quantity' },
            { field: 'expiration', headerName: 'Expiration' },
            { field: 'inaccurateFix', headerName: 'Inaccuracy Quantity of Fix' },
            { field: 'timeEmpty', headerName: 'Time Empty(days)' },
        ];
        for (let i = 1; i <= 100; i++) {
            this.rowData.push({
                sku: i,
                category: this.category[i % 3],
                description: 'dest',
                quantity: Math.floor(Math.random() * 100), // Random quantity between 0 and 99
                requests: Math.floor(Math.random() * 10), // Random requests between 0 and 9
                requestsQuantity: Math.floor(Math.random() * 50),
                expiration: this.getRandomExpirationDate(1),
                inaccurateFix: Math.floor(Math.random() * 10),
                timeEmpty: Math.floor(Math.random() * 4),
            });
        }
        return 'Inventory Report';
    }

    getRandomExpirationDate(minDays: number): Date {
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const randomDay = Math.floor(Math.random() * (daysInMonth - minDays + 1)) + minDays;

        // Set date to random day within the current month
        return new Date(today.getFullYear(), today.getMonth(), randomDay);
    }

    calculateRatio() {
        this.sum = 0;
        this.count = 0;
        this.rowData.forEach((element) => {
            this.requests += element.requests;
        });
        this.rowData.forEach((element) => {
            this.quantity += element.quantity;
            this.count += 1;
        });
        return (this.requests / this.quantity).toFixed(3);
    }

    calculateTotal(column: String): number {
        this.sum = 0;
        switch (column) {
            case 'requests':
                this.rowData.forEach((element) => {
                    this.sum += element.requests;
                });
                break;
            case 'quantity':
                this.rowData.forEach((element) => {
                    this.sum += element.quantity;
                });
                break;
            case 'requestsQuantity':
                this.rowData.forEach((element) => {
                    this.sum += element.requestsQuantity;
                });
                break;
            case 'inaccurateFix':
                this.rowData.forEach((element) => {
                    this.sum += element.inaccurateFix;
                });
                break;
            default:
                break;
        }
        return this.sum;
    }

    calculateTotalEmpty(): number {
        this.count = 0;
        this.rowData.forEach((element) => {
            if (element.quantity == 0) {
                this.count += 1;
            }
        });
        return this.count;
    }

    calculateCategoryTotalQuantities(): Map<string, number> {
        const categoryTotals = new Map<string, number>();

        this.rowData.forEach((element) => {
            const category = element.category;
            const currentTotal = categoryTotals.get(category) || 0;
            categoryTotals.set(category, currentTotal + element.quantity);
        });
        return categoryTotals;
    }

    calculateCategoryTotalRequests(): Map<string, number> {
        const categoryTotals = new Map<string, number>();

        this.rowData.forEach((element) => {
            const category = element.category;
            const currentTotal = categoryTotals.get(category) || 0;
            categoryTotals.set(category, currentTotal + element.requests);
        });
        return categoryTotals;
    }

    calculateCategoryTotalRequestsQuantity(): Map<string, number> {
        const categoryTotals = new Map<string, number>();

        this.rowData.forEach((element) => {
            const category = element.category;
            const currentTotal = categoryTotals.get(category) || 0;
            categoryTotals.set(category, currentTotal + element.requestsQuantity);
        });
        return categoryTotals;
    }

    calculateAccuracy() {
        const inacc = this.calculateTotal('inaccurateFix');
        const total = this.calculateTotal('quantity');
        return ((1 - inacc / total) * 100).toFixed(2);
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
