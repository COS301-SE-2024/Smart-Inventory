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
import { StackedbarchartComponent } from '../../charts/stackedbarchart/stackedbarchart.component';
import { ScatterplotComponent } from '../../charts/scatterplot/scatterplot.component';
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
        StackedbarchartComponent
    ],
    templateUrl: './order-report.component.html',
    styleUrl: './order-report.component.css',
})
export class OrderReportComponent implements OnInit {
    stackedBarChartData: any[] = [];
    scatterPlotChartData: any[] = [];
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }

    rowData: any[] = [];

    selectedItem: any = null;
    requestQuantity: number | null = null;
    supplierQuote: any[] = [];

    OrderReport = {
        title: 'Order Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            metric_1: 'Total orders: ',
            metric_2: 'Orders in progress: ',
            metric_3: 'Total orders through automation: ',
            // metric_4: 'Average order time: ',
            // metric_5: 'Supplier performance index: ',
            // metric_6: 'Order cost analysis: ',
            metric_7: 'Rate of returns: ',
            metric_8: 'Order placement frequency: ',
            // metric_9: 'Average order trips reduced: ',
            metric_10: 'Automated order frequency: ',
            metric_11: 'Perfect Order Rate: ',
        },
        graphs: [],
    };
    async ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
        this.updateVisibleMetrics();
        this.rowData = await this.fetchOrders();
        this.calculateMetrics();
        this.supplierQuote = await this.supplierQuotePrices();
        this.updateOrderStatuses(this.rowData, this.supplierQuote);
        this.prepareChartData();
        this.scatterPlotChartData = this.prepareScatterPlotData();
        console.log('scatter plot in parent', this.scatterPlotChartData)
    }

    calculateMetrics() {
        // this.OrderReport.metrics.metric_1 += this.rowData.length;
        // this.OrderReport.metrics.metric_2 += this.rowData.filter(order => order.status === 'In Progress').length;
        // this.OrderReport.metrics.metric_4 += this.calculateAverageOrderTime() + ' days';
        // this.OrderReport.metrics.metric_5 += this.calculateSupplierPerformance() + '%';
        // this.OrderReport.metrics.metric_6 += 'R ' + this.calculateOrderCostAnalysis().averageCost.toFixed(2);
    }

    calculateAverageOrderTime() {
        const totalDays = this.rowData.reduce((sum, order) => {
            const issuedDate = new Date(order.orderIssuedDate);
            const receivedDate = new Date(order.orderReceivedDate);
            const timeDifference = (receivedDate.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24);
            return sum + timeDifference;
        }, 0);
        return totalDays / this.rowData.length;
    }

    calculateSupplierPerformance() {
        const onTimeCount = this.rowData.filter(order => {
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
            { field: 'orderID', headerName: 'Order ID' },
            { field: 'orderIssuedDate', headerName: 'Issued Date' },
            { field: 'expectedOrderDate', headerName: 'Expected Date' },
            { field: 'supplier', headerName: 'Supplier' },
            { field: 'address', headerName: 'Address' },
            { field: 'orderCost', headerName: 'Order Cost' },
            { field: 'orderReceivedDate', headerName: 'Received Date' },
            { field: 'status', headerName: 'Status' },
            { field: 'quoteStatus', headerName: 'Quote Status' },
        ];
        return 'Order Report';
    }

    async supplierQuotePrices() {
        const supplierQuotePrices = [
            { "QuoteID": "ZBx2K0", "upc_SupplierID": "6005001234012_JHBTraders", "AvailableQuantity": 45, "Discount": 3, "IsAvailable": true, "ItemSKU": "GF-301", "SupplierID": "JHB Traders", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-16T10:20:30.123Z", "TotalPrice": 405.00, "UnitPrice": 9, "upc": "6005001234012" },
            { "QuoteID": "Xwd3K1", "upc_SupplierID": "6004002345023_CapeSupplies", "AvailableQuantity": 30, "Discount": 5, "IsAvailable": false, "ItemSKU": "PK-100", "SupplierID": "Cape Supplies", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-16T11:45:22.789Z", "TotalPrice": 570.00, "UnitPrice": 19, "upc": "6004002345023" },
            { "QuoteID": "Hnq5T2", "upc_SupplierID": "6003001256034_DurbanGoods", "AvailableQuantity": 50, "Discount": 7, "IsAvailable": true, "ItemSKU": "LS-212", "SupplierID": "Durban Goods", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-16T14:05:16.456Z", "TotalPrice": 650.00, "UnitPrice": 13, "upc": "6003001256034" },
            { "QuoteID": "Mbq6U3", "upc_SupplierID": "6002004567045_PretoriaMerch", "AvailableQuantity": 20, "Discount": 10, "IsAvailable": true, "ItemSKU": "MT-104", "SupplierID": "Pretoria Merchandise", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-16T16:30:18.789Z", "TotalPrice": 360.00, "UnitPrice": 18, "upc": "6002004567045" },
            { "QuoteID": "Opy7V4", "upc_SupplierID": "6001007898056_BloemRetail", "AvailableQuantity": 40, "Discount": 15, "IsAvailable": true, "ItemSKU": "BT-502", "SupplierID": "Bloem Retail", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-16T19:15:24.567Z", "TotalPrice": 480.00, "UnitPrice": 12, "upc": "6001007898056" },
            { "QuoteID": "Lqd8W5", "upc_SupplierID": "6006009109067_EastCoastSupplies", "AvailableQuantity": 35, "Discount": 12, "IsAvailable": true, "ItemSKU": "EC-201", "SupplierID": "East Coast Supplies", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-17T07:40:35.678Z", "TotalPrice": 490.00, "UnitPrice": 14, "upc": "6006009109067" },
            { "QuoteID": "Ckd9X6", "upc_SupplierID": "6007003045078_KimberleyKits", "AvailableQuantity": 25, "Discount": 20, "IsAvailable": true, "ItemSKU": "KK-303", "SupplierID": "Kimberley Kits", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-17T09:50:45.789Z", "TotalPrice": 375.00, "UnitPrice": 15, "upc": "6007003045078" },
            { "QuoteID": "Vle0Y7", "upc_SupplierID": "6008004026089_PortElizabethProducts", "AvailableQuantity": 10, "Discount": 25, "IsAvailable": false, "ItemSKU": "PE-408", "SupplierID": "Port Elizabeth Products", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-17T12:00:50.123Z", "TotalPrice": 150.00, "UnitPrice": 15, "upc": "6008004026089" },
            { "QuoteID": "Ymf1Z8", "upc_SupplierID": "6009005037090_MpumalangaMovers", "AvailableQuantity": 60, "Discount": 5, "IsAvailable": true, "ItemSKU": "MM-502", "SupplierID": "Mpumalanga Movers", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-17T15:20:55.234Z", "TotalPrice": 900.00, "UnitPrice": 15, "upc": "6009005037090" },
            { "QuoteID": "Uon2A9", "upc_SupplierID": "6010006048101_NorthWestNecessities", "AvailableQuantity": 15, "Discount": 8, "IsAvailable": true, "ItemSKU": "NW-101", "SupplierID": "North West Necessities", "tenentId": "1717667019559-j85syk", "Timestamp": "2024-08-17T17:45:59.345Z", "TotalPrice": 225.00, "UnitPrice": 15, "upc": "6010006048101" }
        ]
        
        return supplierQuotePrices;
    }

    metrics: any[] = [
        { icon: 'shopping_cart', iconLabel: 'Total orders', metricName: 'Total orders', value: '12' },
        { icon: 'timer', iconLabel: 'Average order time', metricName: 'Average order time', value: '3.58 days' },
        { icon: 'trending_up', iconLabel: 'Supplier performance index', metricName: 'Supplier performance index', value: '100.00%' },
        { icon: 'attach_money', iconLabel: 'Order cost analysis', metricName: 'Order cost analysis', value: 'R 1229.17' },
        { icon: 'assignment', iconLabel: 'Orders in progress', metricName: 'Orders in progress', value: '2' }
    ];

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
        const orders = [
            { "orderID": 1, "orderIssuedDate": "2021-01-01", "expectedOrderDate": "2021-01-05", "supplier": "ProVision Supplies", "orderCost": 1000, "orderReceivedDate": "2021-01-04", "status": "Completed", "quoteStatus": "Approved", "address": "123 Elm St, Johannesburg" },
            { "orderID": 2, "orderIssuedDate": "2022-02-15", "expectedOrderDate": "2022-02-20", "supplier": "Cape Industrial Goods", "orderCost": 1500, "orderReceivedDate": "2022-02-19", "status": "In Progress", "quoteStatus": "Approved", "address": "456 Oak St, Cape Town" },
            { "orderID": 3, "orderIssuedDate": "2021-03-10", "expectedOrderDate": "2021-03-15", "supplier": "ProVision Supplies", "orderCost": 1200, "orderReceivedDate": "2021-03-14", "status": "Delayed", "quoteStatus": "No Status", "address": "789 Pine St, Durban" },
            { "orderID": 4, "orderIssuedDate": "2022-04-22", "expectedOrderDate": "2022-04-25", "supplier": "Johannesburg Traders", "orderCost": 1100, "orderReceivedDate": "2022-04-24", "status": "Completed", "quoteStatus": "Approved", "address": "101 Maple Ave, Johannesburg" },
            { "orderID": 5, "orderIssuedDate": "2023-05-05", "expectedOrderDate": "2023-05-10", "supplier": "Cape Industrial Goods", "orderCost": 1600, "orderReceivedDate": "2023-05-09", "status": "In Progress", "quoteStatus": "Approved", "address": "202 Birch Rd, Cape Town" },
            { "orderID": 6, "orderIssuedDate": "2023-06-01", "expectedOrderDate": "2023-06-05", "supplier": "ProVision Supplies", "orderCost": 1300, "orderReceivedDate": "2023-06-04", "status": "Pending", "quoteStatus": "No Status", "address": "303 Cedar St, Durban" },
            { "orderID": 7, "orderIssuedDate": "2021-07-07", "expectedOrderDate": "2021-07-12", "supplier": "Durban Warehouse", "orderCost": 1400, "orderReceivedDate": "2021-07-11", "status": "Pending", "quoteStatus": "No Status", "address": "404 Birch Rd, Cape Town" },
            { "orderID": 8, "orderIssuedDate": "2022-08-15", "expectedOrderDate": "2022-08-20", "supplier": "ProVision Supplies", "orderCost": 950, "orderReceivedDate": "2022-08-19", "status": "Delayed", "quoteStatus": "No Status", "address": "505 Pine St, Durban" },
            { "orderID": 9, "orderIssuedDate": "2023-09-10", "expectedOrderDate": "2023-09-15", "supplier": "Cape Industrial Goods", "orderCost": 1150, "orderReceivedDate": "2023-09-14", "status": "Completed", "quoteStatus": "Approved", "address": "606 Oak St, Cape Town" },
            { "orderID": 10, "orderIssuedDate": "2021-10-20", "expectedOrderDate": "2021-10-25", "supplier": "Johannesburg Traders", "orderCost": 500, "orderReceivedDate": "2021-10-24", "status": "Cancelled", "quoteStatus": "No Status", "address": "707 Elm St, Johannesburg" },
            { "orderID": 11, "orderIssuedDate": "2022-11-11", "expectedOrderDate": "2022-11-15", "supplier": "Durban Warehouse", "orderCost": 1250, "orderReceivedDate": "2022-11-14", "status": "Completed", "quoteStatus": "Approved", "address": "808 Cedar St, Durban" },
            { "orderID": 12, "orderIssuedDate": "2023-12-05", "expectedOrderDate": "2023-12-10", "supplier": "ProVision Supplies", "orderCost": 1800, "orderReceivedDate": "2023-12-09", "status": "Delayed", "quoteStatus": "Approved", "address": "909 Birch Rd, Cape Town" },
            { "orderID": 13, "orderIssuedDate": "2024-01-01", "expectedOrderDate": "2024-01-05", "supplier": "Cape Industrial Goods", "orderCost": 2000, "orderReceivedDate": "2024-01-04", "status": "In Progress", "quoteStatus": "Approved", "address": "110 Pine Ave, Cape Town" },
            { "orderID": 14, "orderIssuedDate": "2024-02-10", "expectedOrderDate": "2024-02-15", "supplier": "Johannesburg Traders", "orderCost": 1700, "orderReceivedDate": "2024-02-14", "status": "Completed", "quoteStatus": "Approved", "address": "120 Oak St, Johannesburg" },
            { "orderID": 15, "orderIssuedDate": "2024-03-15", "expectedOrderDate": "2024-03-20", "supplier": "Durban Warehouse", "orderCost": 1500, "orderReceivedDate": "2024-03-19", "status": "Pending", "quoteStatus": "No Status", "address": "130 Elm St, Durban" }
        ];


        return orders;
    }

    updateOrderStatuses(orders: any[], suppliers: any[]) {
        const supplierIDs = suppliers.map(supplier => supplier.SupplierID);
        orders.forEach(order => {
            if (supplierIDs.includes(order.supplier)) {
                order.quoteStatus = 'Accepted';
                order.status = 'Pending';
            }
        });
    }

    prepareChartData(): void {
        const dataMap = new Map();

        this.rowData.forEach(order => {
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
            delayed: counts.delayed
        }));

        console.log('Prepared Chart Data:', this.stackedBarChartData);
    }

    prepareScatterPlotData() {
        const supplierQuoteData = this.supplierQuote.map(item => ({
            unitPrice: item.UnitPrice,
            discount: item.Discount,
            availableQuantity: item.AvailableQuantity,
            itemSKU: item.ItemSKU
        }));

        return supplierQuoteData;
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
