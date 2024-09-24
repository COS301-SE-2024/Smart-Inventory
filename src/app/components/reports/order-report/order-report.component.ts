import { TitleService } from '../../header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { ActivatedRoute, Router } from '@angular/router';
import { DonutTemplateComponent } from 'app/components/charts/donuttemplate/donuttemplate.component';
import { StackedbarchartComponent } from '../../charts/stackedbarchart/stackedbarchart.component';
import { ScatterplotComponent } from '../../charts/scatterplot/scatterplot.component';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from 'app/components/loader/loading-spinner.component';
import { GridsterConfig, GridType, DisplayGrid, GridsterModule, CompactType } from 'angular-gridster2';
import { DataCollectionService } from 'app/components/add-widget-side-pane/data-collection.service';

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
        ScatterplotComponent,
        StackedbarchartComponent,
        DonutTemplateComponent,
        LoadingSpinnerComponent,
        GridsterModule,
    ],
    templateUrl: './order-report.component.html',
    styleUrl: './order-report.component.css',
})
export class OrderReportComponent implements OnInit {
    stackedBarChartData: any[] = [];
    scatterPlotChartData: any[] = [];
    isLoading: boolean = true;
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
        private dataCollectionService: DataCollectionService
    ) {
        Amplify.configure(outputs);
    }

    rowData: any[] = [];
    options: GridsterConfig = {
        gridType: GridType.VerticalFixed,
        displayGrid: DisplayGrid.None,
        compactType: CompactType.CompactUpAndLeft,
        draggable: {
            enabled: false,
        },
        resizable: {
            enabled: false,
        },
        pushItems: true,
        margin: 10,
        minCols: 12,
        maxCols: 12,
        minRows: 100, // Increased minimum rows for better initial height
        maxRows: 100,
        minItemWidth: 100, // Minimum width each item can shrink to
        minItemHeight: 50, // Minimum height each item can shrink to
        minItemCols: 1, // Maximum columns an item can expand to
        minItemRows: 1, // Maximum rows an item can expand to
        fixedRowHeight: 150,
        addEmptyRowsCount: 10,
        disablePushOnDrag: false,
        disablePushOnResize: false,
        pushDirections: { north: true, east: true, south: true, west: true },
        pushResizeItems: false,
        disableWindowResize: false,
        disableWarnings: false,
        scrollToNewItems: false,
    };

    layout: any[] = [
        { cols: 12, rows: 1.1, y: 0, x: 0 }, // Metrics Container
        { cols: 8, rows: 4, y: 1, x: 0 }, // Inventory Grid
        { cols: 4, rows: 3, y: 1, x: 8 }, // Order Report
        { cols: 6, rows: 4, y: 3, x: 0 }, // Stacked Bar Chart
        { cols: 12, rows: 3, y: 3, x: 6 }, // Scatter Plot
        { cols: 6, rows: 4, y: 5, x: 4 }, // Donut Chart
    ];

    selectedItem: any = null;
    requestQuantity: number | null = null;
    supplierQuote: any[] = [];

    OrderReport = {
        title: 'Order Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            metric_3: {
                text: 'Total orders through automation: ',
                icon: 'auto_awesome',
            },
            metric_7: {
                text: 'Rate of returns: ',
                icon: 'assignment_return',
            },
            metric_8: {
                text: 'Order placement frequency: ',
                icon: 'schedule',
            },
            metric_10: {
                text: 'Automated order frequency: ',
                icon: 'update',
            },
            metric_11: {
                text: 'Perfect Order Rate: ',
                icon: 'thumb_up',
            },
        },
        graphs: [],
    };

    async ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
        this.updateVisibleMetrics();
        await this.fetchOrders();
        this.calculateMetrics();
        const data = this.calculateOrderMetrics();
        this.OrderReport.metrics.metric_8.text += data.orderPlacementFrequency;
        this.OrderReport.metrics.metric_11.text += data.perfectOrderRate;
        this.supplierQuote = await this.supplierQuotePrices() || [];
        this.updateOrderStatuses(this.rowData, this.supplierQuote);
        this.prepareChartData();
        this.scatterPlotChartData = this.prepareScatterPlotData();
        this.isLoading = false;
        console.log('scatter plot in parent', this.scatterPlotChartData);
    }

    calculateOrderMetrics() {
        const orders = this.rowData;
        // Sort orders by date
        orders.sort((a, b) => new Date(a.orderIssuedDate).getTime() - new Date(b.orderIssuedDate).getTime());

        // Calculate days between orders
        let totalDaysBetweenOrders = 0;
        for (let i = 1; i < orders.length; i++) {
            const daysBetween =
                (new Date(orders[i].orderIssuedDate).getTime() - new Date(orders[i - 1].orderIssuedDate).getTime()) /
                (1000 * 60 * 60 * 24);
            totalDaysBetweenOrders += daysBetween;
        }

        // Calculate average days between orders
        const averageDaysBetweenOrders = totalDaysBetweenOrders / (orders.length - 1);

        // Perfect Order Rate calculation
        const validOrders = orders.filter((order) => order.status === 'Completed');
        const perfectOrders = validOrders.filter(
            (order) =>
                order.expectedOrderDate &&
                order.orderReceivedDate &&
                new Date(order.orderReceivedDate) <= new Date(order.expectedOrderDate),
        );
        const perfectOrderRate = (perfectOrders.length / validOrders.length) * 100;

        return {
            orderPlacementFrequency: averageDaysBetweenOrders.toFixed(1) + ' days',
            perfectOrderRate: perfectOrderRate.toFixed(2) + '%',
        };
    }

    calculateAverageOrderTime(): number {
        const validOrders = this.rowData.filter(
            (order) => order.orderIssuedDate && order.orderReceivedDate && order.status === 'Completed',
        );

        const uniqueOrders = validOrders.reduce((acc, current) => {
            const x = acc.find((item: { orderID: any }) => item.orderID === current.orderID);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        const totalDays = uniqueOrders.reduce(
            (
                sum: number,
                order: { orderIssuedDate: string | number | Date; orderReceivedDate: string | number | Date },
            ) => {
                const issuedDate = new Date(order.orderIssuedDate);
                const receivedDate = new Date(order.orderReceivedDate);
                const timeDifference = Math.max(
                    1,
                    (receivedDate.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24),
                );
                return sum + timeDifference;
            },
            0,
        );

        return uniqueOrders.length > 0 ? totalDays / uniqueOrders.length : 0;
    }

    calculateSupplierPerformance() {
        const onTimeCount = this.rowData.filter((order) => {
            const expectedDate = new Date(order.expectedOrderDate);
            const receivedDate = new Date(order.orderReceivedDate);
            return receivedDate <= expectedDate;
        }).length;
        return ((onTimeCount / this.rowData.length) * 100).toFixed(2);
    }

    calculateOrderCostAnalysis() {
        const totalCost = this.rowData.reduce((sum, order) => sum + order.orderCost, 0);
        const averageCost = totalCost / this.rowData.length;
        return { averageCost };
    }

    colDefs!: ColDef[];

    getCurrentRoute() {
        this.colDefs = [
            { field: 'orderID', headerName: 'Order ID', filter: 'agSetColumnFilter' },
            { field: 'orderIssuedDate', headerName: 'Issued Date', filter: 'agSetColumnFilter' },
            { field: 'expectedOrderDate', headerName: 'Expected Date', filter: 'agSetColumnFilter' },
            { field: 'supplier', headerName: 'Supplier', filter: 'agSetColumnFilter' },
            { field: 'address', headerName: 'Address', filter: 'agSetColumnFilter' },
            { field: 'orderCost', headerName: 'Order Cost', filter: 'agSetColumnFilter' },
            { field: 'orderReceivedDate', headerName: 'Received Date', filter: 'agSetColumnFilter' },
            { field: 'status', headerName: 'Status', filter: 'agSetColumnFilter' },
            { field: 'quoteStatus', headerName: 'Quote Status', filter: 'agSetColumnFilter' },
        ];
        return 'Order Report';
    }

    async supplierQuotePrices() {
        try {
            return await this.dataCollectionService.getSupplierQuotePrices().toPromise();
        } catch (error) {
            console.error('Error fetching supplier quote prices:', error);
            return [];
        }
    }

    metrics: any[] = [
        {
            icon: 'shopping_cart',
            iconLabel: 'Total orders',
            metricName: 'Total orders',
            value: '0',
            additionalInfo: [
                { level: 'good', text: 'High order volume', threshold: '>100' },
                { level: 'medium', text: 'Moderate order volume', threshold: '50-100' },
                { level: 'bad', text: 'Low order volume', threshold: '<50' },
            ],
        },
        {
            icon: 'timer',
            iconLabel: 'Average order time',
            metricName: 'Average order time',
            value: '0 days',
            additionalInfo: [
                { level: 'good', text: 'Fast processing', threshold: '<3 days' },
                { level: 'medium', text: 'Average processing', threshold: '3-7 days' },
                { level: 'bad', text: 'Slow processing', threshold: '>7 days' },
            ],
        },
        {
            icon: 'trending_up',
            iconLabel: 'Supplier performance index',
            metricName: 'Supplier performance index',
            value: '0%',
            additionalInfo: [
                { level: 'good', text: 'Excellent performance', threshold: '>90%' },
                { level: 'medium', text: 'Satisfactory performance', threshold: '70-90%' },
                { level: 'bad', text: 'Poor performance', threshold: '<70%' },
            ],
        },
        {
            icon: 'attach_money',
            iconLabel: 'Order cost analysis',
            metricName: 'Order cost analysis',
            value: 'R 0',
            additionalInfo: [
                { level: 'good', text: 'Cost-effective', threshold: '<R 1000' },
                { level: 'medium', text: 'Average cost', threshold: 'R 1000-2000' },
                { level: 'bad', text: 'High cost', threshold: '>R 2000' },
            ],
        },
        {
            icon: 'assignment',
            iconLabel: 'Orders in progress',
            metricName: 'Orders in progress',
            value: '0',
            additionalInfo: [
                { level: 'good', text: 'Efficient processing', threshold: '<10' },
                { level: 'medium', text: 'Moderate backlog', threshold: '10-20' },
                { level: 'bad', text: 'High backlog', threshold: '>20' },
            ],
        },
    ];

    getAdditionalInfoClass(metric: any): string {
        const value = this.parseMetricValue(metric.value);
        const info = metric.additionalInfo.find((i: { threshold: string }) =>
            this.isWithinThreshold(value, i.threshold),
        );
        return info ? info.level : 'medium';
    }

    getAdditionalInfo(metric: any): string {
        const value = this.parseMetricValue(metric.value);
        const info = metric.additionalInfo.find((i: { threshold: string }) =>
            this.isWithinThreshold(value, i.threshold),
        );
        return info ? info.text : '';
    }

    private parseMetricValue(value: string): number {
        return parseFloat(value.replace(/[^0-9.-]+/g, ''));
    }

    private isWithinThreshold(value: number, threshold: string): boolean {
        if (threshold.includes('-')) {
            const [min, max] = threshold.split('-').map(Number);
            return value >= min && value <= max;
        } else if (threshold.startsWith('<')) {
            return value < parseFloat(threshold.slice(1));
        } else if (threshold.startsWith('>')) {
            return value > parseFloat(threshold.slice(1));
        }
        return false;
    }

    calculateMetrics() {
        if (this.rowData.length === 0) return;

        // Total orders
        this.metrics[0].value = this.rowData.length.toString();

        // Average order time
        const avgOrderTime = this.calculateAverageOrderTime();
        this.metrics[1].value = `${avgOrderTime.toFixed(2)} days`;

        // Supplier performance index
        const supplierPerformance = this.calculateSupplierPerformance();
        this.metrics[2].value = `${supplierPerformance}%`;

        // Order cost analysis
        const { averageCost } = this.calculateOrderCostAnalysis();
        this.metrics[3].value = `R ${averageCost.toFixed(2)}`;

        // Orders in progress
        const ordersInProgress = this.rowData.filter((order) => order.status === 'Pending Approval').length;
        this.metrics[4].value = ordersInProgress.toString();

        // Update visible metrics after calculation
        this.updateVisibleMetrics();
    }

    visibleMetrics: any[] = [];
    startIndex = 0;
    scrollTiles(direction: 'left' | 'right') {
        if (direction === 'left') {
            this.startIndex = (this.startIndex - 1 + this.metrics.length) % this.metrics.length;
        } else {
            this.startIndex = (this.startIndex + 1) % this.metrics.length;
        }
        this.updateVisibleMetrics();
    }

    private updateVisibleMetrics() {
        this.visibleMetrics = [];
        for (let i = 0; i < 3; i++) {
            const index = (this.startIndex + i) % this.metrics.length;
            this.visibleMetrics.push(this.metrics[index]);
        }
    }

    async fetchOrders() {
        try {
            this.rowData = await this.dataCollectionService.fetchOrdersReport() || [];
            console.log('Processed orders:', this.rowData);
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            this.rowData = [];
        }
    }

    updateOrderStatuses(orders: any[], suppliers: any[]) {
        const supplierIDs = suppliers.map((supplier) => supplier.SupplierID);
        orders.forEach((order) => {
            if (supplierIDs.includes(order.supplier)) {
                order.quoteStatus = 'Accepted';
                order.status = 'Pending';
            }
        });
    }

    prepareChartData(): void {
        const dataMap = new Map();

        this.rowData.forEach((order) => {
            if (!dataMap.has(order.supplier)) {
                dataMap.set(order.supplier, { completed: 0, inProgress: 0, delayed: 0 });
            }

            const entry = dataMap.get(order.supplier);
            if (order.status === 'Completed') {
                entry.completed += 1;
            } else if (order.status === 'In Progress') {
                entry.inProgress += 1;
            } else if (order.status === 'Delayed') {
                entry.delayed += 1;
            }
        });

        this.stackedBarChartData = Array.from(dataMap, ([supplier, counts]) => ({
            supplier: supplier,
            completed: counts.completed,
            inProgress: counts.inProgress,
            delayed: counts.delayed,
        }));

        console.log('Prepared Chart Data:', this.stackedBarChartData);
    }

    prepareScatterPlotData() {
        const supplierQuoteData = this.supplierQuote.map((item) => ({
            unitPrice: item.UnitPrice,
            discount: item.Discount,
            availableQuantity: item.AvailableQuantity,
            itemSKU: item.ItemSKU,
        }));

        return supplierQuoteData;
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
