import { Component, OnInit, ChangeDetectorRef, Type, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleService } from '../../components/header/title.service';
import { MaterialModule } from '../../components/material/material.module';
import { CommonModule } from '@angular/common';
import { SidepanelComponent } from '../../components/sidepanel/sidepanel.component';
import { CompactType, GridsterModule } from 'angular-gridster2';
import { GridType, DisplayGrid } from 'angular-gridster2';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { AddmemberComponent } from '../../components/modal/addmember/addmember.component';
import { BubblechartComponent } from '../../components/charts/bubblechart/bubblechart.component';
import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { FilterService } from '../../services/filter.service';
import { LoadingService } from '../../components/loader/loading.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { MatDialog } from '@angular/material/dialog';
import { TemplatechartComponent } from 'app/components/charts/templatechart/templatechart.component';
import { LoadingSpinnerComponent } from 'app/components/loader/loading-spinner.component';
interface CardData {
    title: string;
    value: string | number;
    icon: string;
    type: 'currency' | 'number' | 'percentage';
    change?: number;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [
        MaterialModule,
        HttpClientModule,
        RouterLink,
        CommonModule,
        AddmemberComponent,
        GridsterModule,
        AgChartsAngular,
        BarchartComponent,
        DonutchartComponent,
        SaleschartComponent,
        BubblechartComponent,
        MatProgressSpinnerModule,
        TemplatechartComponent,
        LoadingSpinnerComponent
    ]
})
export class DashboardComponent implements OnInit {
    isDeleteMode: boolean = false;
    @ViewChild('sidenav') sidenav!: MatSidenav;

    Math: any;

    openSidePanel() {
        this.sidenav.open();
    }

    closeSidePanel() {
        this.sidenav.close();
    }

    private saveTrigger = new Subject<void>();


    rowData: any[] = [];
    dashboardInfo: any[] = [];
    inventoryCount: number = 0;
    userCount: number = 0;

    options: GridsterConfig;
    charts: Type<any>[] = [];
    stockRequest: any[] = [];
    orders: any[] = [];

    cardData: CardData[] = [
        { title: 'Avg Fulfillment Time', value: 164455.00, icon: 'hourglass_full', type: 'currency', change: 5.2 },
        { title: 'Backorders', value: 21790.00, icon: 'assignment_return', type: 'number', change: -3.1 },
        { title: 'Inventory Levels', value: 20, icon: 'storage', type: 'number', change: 10 },
        { title: 'Top Seller', value: 5, icon: 'star_rate', type: 'number', change: -15 },
    ];

    RequestOrders = {
        requests: {
            totalRequests: 0,
            mostRequested: {
                name: "None found",
                percentage: 0
            },
            highestRequest: 0,
        },
        backorders: {
            currentBackorders: 0,
            averageDelay: 0,
            longestBackorderItem: {
                productName: 'None found',
                delay: ''
            }
        }
    };

    dashboard!: Array<GridsterItem>;

    public chartOptions!: AgChartOptions;

    constructor(
        private http: HttpClient,
        private loader: LoadingService,
        private titleService: TitleService,
        private filterService: FilterService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog
    ) {
        Amplify.configure(outputs);
        this.options = {
            gridType: GridType.VerticalFixed,
            displayGrid: DisplayGrid.None,
            compactType: CompactType.CompactUpAndLeft,
            margin: 20,
            minCols: 12,
            maxCols: 12,
            minRows: 100,
            maxRows: 100,
            minItemWidth: 100,
            minItemHeight: 50,
            maxItemCols: 100,
            minItemCols: 1,
            maxItemRows: 100,
            minItemRows: 1,
            maxItemArea: 2500,
            minItemArea: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            fixedColWidth: 105,
            fixedRowHeight: 142,
            keepFixedHeightInMobile: false,
            keepFixedWidthInMobile: false,
            scrollSensitivity: 10,
            scrollSpeed: 20,
            enableEmptyCellDrop: false,
            enableEmptyCellDrag: false,
            emptyCellDragMaxCols: 50,
            emptyCellDragMaxRows: 50,
            ignoreMarginInRow: false,
            draggable: {
                enabled: true,
            },
            resizable: {
                enabled: true,
            },
            swap: true,
            pushItems: false,
            disablePushOnDrag: false,
            disablePushOnResize: false,
            pushDirections: { north: true, east: true, south: true, west: true },
            pushResizeItems: false,
            disableWindowResize: false,
            disableWarnings: false,
            scrollToNewItems: false
        };

        // this.dashboard = [
        //     { cols: 3, rows: 2, y: 0, x: 0, cardData: this.cardData[0] },
        //     { cols: 3, rows: 2, y: 0, x: 1, cardData: this.cardData[1] },
        //     { cols: 3, rows: 2, y: 0, x: 2, cardData: this.cardData[2] },
        //     { cols: 3, rows: 2, y: 0, x: 3, cardData: this.cardData[3] },
        // ];
    }

    async populateRequestOrders(stockRequests: any[], orders: any[]) {
        const requestSummary = new Map<string, number>();

        // Aggregate stock requests
        stockRequests.forEach(request => {
            requestSummary.set(request.sku, (requestSummary.get(request.sku) || 0) + request.quantityRequested);
        });

        const totalRequests = Array.from(requestSummary.values()).reduce((a, b) => a + b, 0);
        const highestRequest = Math.max(...requestSummary.values());
        const mostRequestedSku = [...requestSummary.entries()].reduce((a, b) => a[1] > b[1] ? a : b)[0];
        const mostRequestedPercentage = (requestSummary.get(mostRequestedSku)! / totalRequests) * 100;

        // Process orders for backorder details
        const backorders = orders.filter(order => order.Order_Status === "Pending Approval" && order.Expected_Delivery_Date);
        const delays = backorders.map(order => this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!));
        const totalDelay = delays.reduce((a, b) => a + b, 0);
        const averageDelay = delays.length > 0 ? totalDelay / delays.length : 0;
        const longestDelay = Math.max(...delays);
        const longestBackorderItem = orders.find(order => this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!) === longestDelay);

        return {
            requests: {
                totalRequests,
                mostRequested: {
                    name: mostRequestedSku,
                    percentage: mostRequestedPercentage
                },
                highestRequest
            },
            backorders: {
                currentBackorders: backorders.length,
                averageDelay,
                longestBackorderItem: {
                    productName: longestBackorderItem && longestBackorderItem.Selected_Supplier ? longestBackorderItem.Selected_Supplier : "Up to date",
                    delay: longestBackorderItem ? this.formatDelay(longestDelay) : ""
                }
            }
        };
    }

    private calculateDelay(orderDate: string, expectedDate: string): number {
        const order = new Date(orderDate);
        const expected = new Date(expectedDate);
        return (expected.getTime() - order.getTime()) / (1000 * 3600 * 24);
    }

    private formatDelay(delay: number): string {
        return delay > 0 ? delay.toString() : "";  // Return an empty string if delay is zero or not calculable
    }

    // Integration
    inventoryLevel: number = 20;

    async dashboardData() {
        try {
            // Mocked baseline values (should be dynamically fetched or defined)
            const baselineValues = {
                inventoryLevels: 10, // Baseline inventory levels
                backorders: 5,      // Baseline backorders
                fulfillmentDays: 390 // Baseline average fulfillment days (for comparison)
            };

            const session = await fetchAuthSession();
            this.loader.setLoading(false);

            const cognitoClient = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await cognitoClient.send(getUserCommand);

            const tenantId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

            if (!tenantId) {
                console.error('TenantId not found in user attributes');
                this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });


            const invokeCommand = new InvokeCommand({
                FunctionName: 'getDashboardData',
                Payload: new TextEncoder().encode(JSON.stringify({
                    pathParameters: {
                        tenentId: tenantId, // Spelling as expected by the Lambda function
                    }
                })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);


            if (responseBody.statusCode === 200) {
                const dashboardData = JSON.parse(responseBody.body);
                // console.log('Dashboard Data:', dashboardData);
                console.log('I am a metric', parseFloat((((dashboardData.inventoryLevels - baselineValues.inventoryLevels) / baselineValues.inventoryLevels) * 100).toFixed(2)));

                // Update the dashboardInfo with new data from the Lambda function
                // this.dashboard = [
                //     {
                //         cols: 1,
                //         rows: 1,
                //         y: 0,
                //         x: 4,
                //         name: 'Inventory Levels',
                //         icon: 'storage',
                //         analytic: dashboardData.inventoryLevels.toString(),
                //         percentage: parseFloat((((dashboardData.inventoryLevels - baselineValues.inventoryLevels) / baselineValues.inventoryLevels) * 100).toFixed(2)), // Update this if needed from dashboardData
                //         type: 'card',
                //         isActive: true,
                //         tooltip: 'Current inventory stock count.',
                //     },
                //     {
                //         cols: 1,
                //         rows: 1,
                //         y: 0,
                //         x: 5,
                //         name: 'Backorders',
                //         icon: 'assignment_return',
                //         analytic: dashboardData.backorders.toString(),
                //         percentage: parseFloat((((dashboardData.backorders - baselineValues.backorders) / baselineValues.backorders) * 100).toFixed(2)), // Update this if needed from dashboardData
                //         type: 'card',
                //         isActive: true,
                //         tooltip: 'Orders pending due to lack of stock.',
                //     },
                //     {
                //         cols: 1,
                //         rows: 1,
                //         y: 0,
                //         x: 6,
                //         name: 'Avg Fulfillment Time',
                //         icon: 'hourglass_full',
                //         analytic: dashboardData.avgFulfillmentTime,
                //         percentage: parseFloat((((parseFloat(dashboardData.avgFulfillmentTime.split(" days")[0]) - baselineValues.fulfillmentDays) / baselineValues.fulfillmentDays) * 100).toFixed(2)), // Update this if needed from dashboardData
                //         type: 'card',
                //         isActive: true,
                //         tooltip: 'Average time taken from order placement to shipment.',
                //     },
                //     {
                //         cols: 1,
                //         rows: 1,
                //         y: 0,
                //         x: 7,
                //         name: 'Top Seller',
                //         icon: 'star_rate',
                //         analytic: dashboardData.topSeller,
                //         percentage: parseFloat("0.12"), // Update this if needed from dashboardData
                //         type: 'card',
                //         isActive: true,
                //         tooltip: 'The product with the highest requests.',
                //     },
                // ];
                console.log('Processed dashboard data:', this.dashboardInfo);
            } else {
                console.error('Error fetching dashboard data:', responseBody.body);
                this.dashboardInfo = [];
            }
        } catch (error) {
            console.error('Error in dashboardData:', error);
            this.dashboardInfo = [];
        }
        finally {
            // this..isLoading = false;
        }
    }

    isLoading: boolean = true;
    async loadOrdersData() {
        // this.isLoading = true;
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
                FunctionName: 'getOrders',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const orders = JSON.parse(responseBody.body);
                this.orders = orders;
                console.log('Processed orders:', orders);

            } else {
                console.error('Error fetching orders data:', responseBody.body);
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            this.rowData = [];
        } finally {
            // this..isLoading = false;
        }
    }

    async loadStockData() {
        // this.isLoading = true;
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
            // const tenentId = '1718890159961-q85m9';

            if (!tenentId) {
                console.error('TenentId not found in user attributes');
                // this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getStockRequests',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const orders = JSON.parse(responseBody.body);
                // orders.forEach((request: { category: string | number; quantityRequested: number; }) => {
                //     if (this.inventoryData[request.category]) {
                //         this.inventoryData[request.category].requestedStock = (this.inventoryData[request.category].requestedStock || 0) + request.quantityRequested;
                //     } else {
                //         this.inventoryData[request.category] = { currentStock: 0, requestedStock: request.quantityRequested };
                //     }
                // });
                // this.updateChartData();
                this.stockRequest = orders;
                console.log('Processed orders:', orders);
            } else {
                console.error('Error fetching orders data:', responseBody.body);
                // this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            // this.rowData = [];
        } finally {
            // this..isLoading = false;
        }
    }

    async fetchUsers() {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            // Retrieve the custom attribute using GetUserCommand
            const client = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await client.send(getUserCommand);

            const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
                (attr) => attr.Name === 'custom:tenentId'
            )?.Value;

            const payload = JSON.stringify({
                userPoolId: outputs.auth.user_pool_id,
                tenentId: adminUniqueAttribute,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getUsers',
                Payload: new TextEncoder().encode(payload),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const users = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            // console.log('Users received from Lambda:', users);

            this.userCount = Array.isArray(users) ? users.length : 0;
            console.log('Number of users received:', this.userCount);
        } catch (error) {
            console.error('Error fetching users:', error);
            this.userCount = 0; // Ensure user count is set to 0 in case of errors
        } finally {
            // this..isLoading = false;
        }
    }

    sidebarOpen: boolean = false;

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    async ngOnInit() {
        // this.loadState(); // Load the state on initialization
        // this.loadNewCharts();
        this.titleService.updateTitle('Dashboard');
        this.initializeDashboard();
        // await this.loadInventoryData();
        // await this.fetchUsers();
        // await this.dashboardData();
        // await this.loadOrdersData();
        // await this.loadStockData();
        // this.RequestOrders = await this.populateRequestOrders(this.stockRequest, this.orders);
        this.isLoading = false;
    }

    initializeDashboard() {
        if (this.cardData && this.cardData.length > 0) {
            this.dashboard = [
                // Existing cards
                ...this.cardData.map((data, index) => ({
                    cols: 3,
                    rows: 1,
                    y: 0,
                    x: index * 3,
                    cardData: data
                })),
                // First full-width item
                {
                    cols: 12,
                    rows: 3,
                    y: 2,
                    x: 0,
                },
                // Second full-width item
                {
                    cols: 12,
                    rows: 2,
                    y: 4,
                    x: 0,
                },
                // First half-width item
                {
                    cols: 6,
                    rows: 2,
                    y: 6,
                    x: 0,
                },
                // Second half-width item
                {
                    cols: 6,
                    rows: 2,
                    y: 6,
                    x: 6,
                }
            ];
        }

        this.cdr.detectChanges();
    }

    getColor(change: number | undefined): string {
        if (change === undefined) return 'text-gray-500';
        return change >= 0 ? 'text-green-500' : 'text-red-500';
    }

    getIcon(change: number | undefined): string {
        if (change === undefined) return 'remove';
        return change >= 0 ? 'arrow_upward' : 'arrow_downward';
    }

    formatValue(value: number | string, type: string): string {
        if (typeof value === 'number') {
            switch (type) {
                case 'currency':
                    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
                case 'number':
                    return value.toString();
                default:
                    return value.toString();
            }
        }
        return value;
    }

    getProgressRingStyle(change: number): string {
        const absChange = Math.abs(change);
        const color = change >= 0 ? '#4CAF50' : '#F44336';
        const degree = (absChange / 100) * 360;
        return `conic-gradient(${color} 0deg ${degree}deg, #f0f0f0 ${degree}deg 360deg)`;
    }

    getChangeColor(change: number): string {
        return change >= 0 ? 'positive-change' : 'negative-change';
    }
}
