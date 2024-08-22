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
        DonutTemplateComponent
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
    ) {
        Amplify.configure(outputs);
    }

    rowData: any[] = [];

    selectedItem: any = null;
    requestQuantity: number | null = null;
    supplierQuote: any[] = [];

    OrderReport = {
        title: 'Order Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            // metric_1: 'Total orders: ',
            // metric_2: 'Orders in progress: ',
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
        await this.fetchOrders();
        this.calculateMetrics();
        const data = this.calculateOrderMetrics();
        this.OrderReport.metrics.metric_8 += data.orderPlacementFrequency;
        this.OrderReport.metrics.metric_11 += data.perfectOrderRate;
        this.supplierQuote = await this.supplierQuotePrices();
        this.updateOrderStatuses(this.rowData, this.supplierQuote);
        this.prepareChartData();
        this.scatterPlotChartData = this.prepareScatterPlotData();
        console.log('scatter plot in parent', this.scatterPlotChartData);
    }

    calculateOrderMetrics() {
        const orders = this.rowData;
        // Sort orders by date
        orders.sort((a, b) => new Date(a.orderIssuedDate).getTime() - new Date(b.orderIssuedDate).getTime());

        // Calculate days between orders
        let totalDaysBetweenOrders = 0;
        for (let i = 1; i < orders.length; i++) {
            const daysBetween = (new Date(orders[i].orderIssuedDate).getTime() - new Date(orders[i - 1].orderIssuedDate).getTime()) / (1000 * 60 * 60 * 24);
            totalDaysBetweenOrders += daysBetween;
        }

        // Calculate average days between orders
        const averageDaysBetweenOrders = totalDaysBetweenOrders / (orders.length - 1);

        // Perfect Order Rate calculation
        const validOrders = orders.filter(order => order.status === "Completed");
        const perfectOrders = validOrders.filter(order =>
            order.expectedOrderDate && order.orderReceivedDate &&
            new Date(order.orderReceivedDate) <= new Date(order.expectedOrderDate)
        );
        const perfectOrderRate = (perfectOrders.length / validOrders.length) * 100;

        return {
            orderPlacementFrequency: averageDaysBetweenOrders.toFixed(1) + " days",
            perfectOrderRate: perfectOrderRate.toFixed(2) + "%"
        };
    }

    calculateAverageOrderTime(): number {
        const validOrders = this.rowData.filter(order =>
            order.orderIssuedDate &&
            order.orderReceivedDate &&
            order.status === 'Completed'
        );

        const uniqueOrders = validOrders.reduce((acc, current) => {
            const x = acc.find((item: { orderID: any; }) => item.orderID === current.orderID);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, []);

        const totalDays = uniqueOrders.reduce((sum: number, order: { orderIssuedDate: string | number | Date; orderReceivedDate: string | number | Date; }) => {
            const issuedDate = new Date(order.orderIssuedDate);
            const receivedDate = new Date(order.orderReceivedDate);
            const timeDifference = Math.max(1, (receivedDate.getTime() - issuedDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + timeDifference;
        }, 0);

        return uniqueOrders.length > 0 ? totalDays / uniqueOrders.length : 0;
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
        try {
            const session = await fetchAuthSession();

            const cognitoClient = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await cognitoClient.send(getUserCommand);

            const tenantId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;
            // const tenantId = "1717667019559-j85syk";
            console.log('my id', tenantId);

            if (!tenantId) {
                console.error('TenantId not found in user attributes');
                // this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getSupplierQuotePrices',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const supplierData = JSON.parse(responseBody.body);
                return supplierData;
            } else {
                console.error('Error fetching inventory data:', responseBody.body);
                // this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
            // this.rowData = [];
        } finally {
            // this.isLoading = false;
        }
    }

    metrics: any[] = [
        { icon: 'shopping_cart', iconLabel: 'Total orders', metricName: 'Total orders', value: '0' },
        { icon: 'timer', iconLabel: 'Average order time', metricName: 'Average order time', value: '0 days' },
        { icon: 'trending_up', iconLabel: 'Supplier performance index', metricName: 'Supplier performance index', value: '0%' },
        { icon: 'attach_money', iconLabel: 'Order cost analysis', metricName: 'Order cost analysis', value: 'R 0' },
        { icon: 'assignment', iconLabel: 'Orders in progress', metricName: 'Orders in progress', value: '0' }
    ];

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
        const ordersInProgress = this.rowData.filter(order => order.status === 'Pending Approval').length;
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
        this.isLoading = true;
        try {
            const session = await fetchAuthSession();

            const cognitoClient = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await cognitoClient.send(getUserCommand);

            const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

            if (!tenentId) {
                console.error('TenentId not found in user attributes');
                this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getOrdersReport',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const orders = JSON.parse(responseBody.body);
                this.rowData = orders;
                console.log('Processed orders:', this.rowData);
            } else {
                console.error('Error fetching orders data:', responseBody.body);
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
        }
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
