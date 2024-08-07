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
        // SaleschartComponent,
        StackedbarchartComponent
    ],
    templateUrl: './order-report.component.html',
    styleUrl: './order-report.component.css',
})
export class OrderReportComponent implements OnInit {
    stackedBarChartData: any[] = [];
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
            metric_4: 'Average order time: ',
            metric_5: 'Supplier performance index: ',
            metric_6: 'Order cost analysis: ',
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

        this.rowData = await this.fetchOrders();
        this.calculateMetrics();
        this.supplierQuote = await this.supplierQuotePrices();
        this.updateOrderStatuses(this.rowData, this.supplierQuote);
    }

    calculateMetrics() {
        this.OrderReport.metrics.metric_1 += this.rowData.length;
        this.OrderReport.metrics.metric_2 += this.rowData.filter(order => order.status === 'In Progress').length;
        this.OrderReport.metrics.metric_4 += this.calculateAverageOrderTime() + ' days';
        this.OrderReport.metrics.metric_5 += this.calculateSupplierPerformance() + '%';
        this.OrderReport.metrics.metric_6 += 'R ' + this.calculateOrderCostAnalysis().averageCost.toFixed(2);
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
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6001007025806_20f7ce39-aa7f-438f-8948-c412791deba5", AvailableQuantity: 58, Discount: 4, IsAvailable: true, ItemSKU: "BF-001", SupplierID: "20f7ce39-aa7f-438f-8948-c412791deba5", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:23:35.783Z", TotalPrice: 334.08, UnitPrice: 6, upc: "6001007025806" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6001007025806_3126556f-a27b-448f-979f-035e8646442c", AvailableQuantity: 58, Discount: 4, IsAvailable: true, ItemSKU: "BF-001", SupplierID: "3126556f-a27b-448f-979f-035e8646442c", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:21:21.794Z", TotalPrice: 111.36, UnitPrice: 2, upc: "6001007025806" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6001068344603_20f7ce39-aa7f-438f-8948-c412791deba5", AvailableQuantity: 20, Discount: 8, IsAvailable: true, ItemSKU: "MS-301", SupplierID: "20f7ce39-aa7f-438f-8948-c412791deba5", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:23:35.783Z", TotalPrice: 220.8, UnitPrice: 12, upc: "6001068344603" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6001068344603_3126556f-a27b-448f-979f-035e8646442c", AvailableQuantity: 20, Discount: 8, IsAvailable: true, ItemSKU: "MS-301", SupplierID: "3126556f-a27b-448f-979f-035e8646442c", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:21:21.794Z", TotalPrice: 73.6, UnitPrice: 4, upc: "6001068344603" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6001240100070_20f7ce39-aa7f-438f-8948-c412791deba5", AvailableQuantity: 13, Discount: 6, IsAvailable: true, ItemSKU: "CH-205", SupplierID: "20f7ce39-aa7f-438f-8948-c412791deba5", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:23:35.783Z", TotalPrice: 109.98, UnitPrice: 9, upc: "6001240100070" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6001240100070_3126556f-a27b-448f-979f-035e8646442c", AvailableQuantity: 13, Discount: 6, IsAvailable: true, ItemSKU: "CH-205", SupplierID: "3126556f-a27b-448f-979f-035e8646442c", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:21:21.794Z", TotalPrice: 36.66, UnitPrice: 3, upc: "6001240100070" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6009178231239_20f7ce39-aa7f-438f-8948-c412791deba5", AvailableQuantity: 29, Discount: 10, IsAvailable: true, ItemSKU: "RO-102", SupplierID: "20f7ce39-aa7f-438f-8948-c412791deba5", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:23:35.783Z", TotalPrice: 391.5, UnitPrice: 15, upc: "6009178231239" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6009178231239_3126556f-a27b-448f-979f-035e8646442c", AvailableQuantity: 29, Discount: 10, IsAvailable: true, ItemSKU: "RO-102", SupplierID: "3126556f-a27b-448f-979f-035e8646442c", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:21:21.794Z", TotalPrice: 130.5, UnitPrice: 5, upc: "6009178231239" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6009880328190_20f7ce39-aa7f-438f-8948-c412791deba5", AvailableQuantity: 14, Discount: 2, IsAvailable: true, ItemSKU: "AM-405", SupplierID: "20f7ce39-aa7f-438f-8948-c412791deba5", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:23:35.783Z", TotalPrice: 41.16, UnitPrice: 3, upc: "6009880328190" },
            { QuoteID: "lzh2zwopu8g5ianp60i", upc_SupplierID: "6009880328190_3126556f-a27b-448f-979f-035e8646442c", AvailableQuantity: 14, Discount: 2, IsAvailable: true, ItemSKU: "AM-405", SupplierID: "3126556f-a27b-448f-979f-035e8646442c", tenentId: "1717667019559-j85syk", Timestamp: "2024-08-06T21:21:21.794Z", TotalPrice: 13.72, UnitPrice: 1, upc: "6009880328190" }
        ];
        return supplierQuotePrices;
    }


    async fetchOrders() {
        const orders = [
            { orderID: 1, orderIssuedDate: '2023-01-01', expectedOrderDate: '2023-01-05', supplier: '20f7ce39-aa7f-438f-8948-c412791deba5', orderCost: 1000, orderReceivedDate: '2023-01-04', status: 'Completed', quoteStatus: 'Approved', address: '123 Elm St, Springfield' },
            { orderID: 2, orderIssuedDate: '2023-01-02', expectedOrderDate: '2023-01-06', supplier: '3126556f-a27b-448f-979f-035e8646442c', orderCost: 1500, orderReceivedDate: '2023-01-05', status: 'In Progress', quoteStatus: 'Pending', address: '456 Oak St, Riverdale' },
            { orderID: 3, orderIssuedDate: '2023-01-03', expectedOrderDate: '2023-01-07', supplier: '20f7ce39-aa7f-438f-8948-c412791deba5', orderCost: 1200, orderReceivedDate: '2023-01-08', status: 'Delayed', quoteStatus: 'Approved', address: '789 Pine St, Shelbyville' },
            { orderID: 4, orderIssuedDate: '2023-01-04', expectedOrderDate: '2023-01-08', supplier: 'unknown_supplier_id', orderCost: 1100, orderReceivedDate: '2023-01-07', status: 'Completed', quoteStatus: 'Rejected', address: '101 Maple Ave, Springfield' },
            { orderID: 5, orderIssuedDate: '2023-01-05', expectedOrderDate: '2023-01-09', supplier: '3126556f-a27b-448f-979f-035e8646442c', orderCost: 1600, orderReceivedDate: '2023-01-09', status: 'In Progress', quoteStatus: 'Approved', address: '202 Birch Rd, Riverdale' },
            { orderID: 6, orderIssuedDate: '2023-01-06', expectedOrderDate: '2023-01-10', supplier: '20f7ce39-aa7f-438f-8948-c412791deba5', orderCost: 1300, orderReceivedDate: '2023-01-11', status: 'Completed', quoteStatus: 'Approved', address: '303 Cedar St, Shelbyville' },
            // Additional orders
            { orderID: 7, orderIssuedDate: '2023-01-07', expectedOrderDate: '2023-01-11', supplier: '20f7ce39-aa7f-438f-8948-c412791deba5', orderCost: 1400, orderReceivedDate: '2023-01-10', status: 'No Status', quoteStatus: 'No Status', address: '404 Birch Rd, Riverdale' },
            { orderID: 8, orderIssuedDate: '2023-01-08', expectedOrderDate: '2023-01-12', supplier: '3126556f-a27b-448f-979f-035e8646442c', orderCost: 950, orderReceivedDate: '2023-01-11', status: 'No Status', quoteStatus: 'No Status', address: '505 Pine St, Shelbyville' },
            { orderID: 9, orderIssuedDate: '2023-01-09', expectedOrderDate: '2023-01-13', supplier: '20f7ce39-aa7f-438f-8948-c412791deba5', orderCost: 1150, orderReceivedDate: '2023-01-12', status: 'No Status', quoteStatus: 'No Status', address: '606 Oak St, Riverdale' },
            { orderID: 10, orderIssuedDate: '2023-01-10', expectedOrderDate: '2023-01-14', supplier: 'unknown_supplier_id_2', orderCost: 500, orderReceivedDate: '2023-01-13', status: 'No Status', quoteStatus: 'No Status', address: '707 Elm St, Springfield' }
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

    back() {
        this.router.navigate(['/reports']);
    }
}
