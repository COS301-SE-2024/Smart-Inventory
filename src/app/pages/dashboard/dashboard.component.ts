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
import { DeleteConfirmationModalComponent } from './deleteWidget';
import { BarChartComponent } from 'app/components/charts/widgets/widgetBar';
import { LineChartComponent } from 'app/components/charts/widgets/widgetLine';
import { PieChartComponent } from 'app/components/charts/widgets/widgetPie';
interface CardData {
    title: string;
    value: string | number;
    icon: string;
    type: 'currency' | 'number' | 'percentage' | 'string';
    change?: number;
}

interface DashboardItem extends GridsterItem {
    cardId?: string;
    name?: string;
    component?: string;
}


interface ChartConfig {
    type: string;
    data: any;
    title: string;
    component: string;
}

interface DashboardData {
    avgFulfillmentTime: number;
    inventoryLevels: number;
    topSeller: string;
    baselineValues: {
        fulfillmentDays: number;
        backorders: number;
        inventoryLevels: number;
    };
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
        LoadingSpinnerComponent,
        LineChartComponent,
        PieChartComponent,
        BarChartComponent
    ]
})
export class DashboardComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;

    isDeleteMode: boolean = false;
    isSidepanelOpen: boolean = false;
    availableCharts: { name: string, component: string }[] = [
        { name: 'Monthly Sales', component: 'BarChartComponent' },
        { name: 'Quarterly Revenue', component: 'LineChartComponent' },
        { name: 'Market Share', component: 'PieChartComponent' }
    ];

    Math: any;

    openSidePanel() {
        this.sidenav.open();
    }

    closeSidePanel() {
        this.sidenav.close();
    }

    private saveTrigger = new Subject<void>();


    charts: { [key: string]: Type<any> } = {
        'SaleschartComponent': SaleschartComponent,
        'BarchartComponent': BarchartComponent,
        'BubblechartComponent': BubblechartComponent,
        'DonutchartComponent': DonutchartComponent,
        'BarChartComponent': BarChartComponent,
        'LineChartComponent': LineChartComponent,
        'PieChartComponent': PieChartComponent
    };


    rowData: any[] = [];
    dashboardData: DashboardData = {
        avgFulfillmentTime: 0,
        inventoryLevels: 0,
        topSeller: 'N/A',
        baselineValues: {
            inventoryLevels: 10, // Baseline inventory levels
            backorders: 5,      // Baseline backorders
            fulfillmentDays: 390 // Baseline average fulfillment days (for comparison)
        }
    };
    inventoryCount: number = 0;
    userCount: number = 0;

    options: GridsterConfig;
    stockRequest: any[] = [];
    orders: any[] = [];

    cardData: CardData[] = [
        // { title: 'Avg Fulfillment Time', value: 164455.00, icon: 'hourglass_full', type: 'currency', change: 5.2 },
        // { title: 'Backorders', value: 21790.00, icon: 'assignment_return', type: 'number', change: -3.1 },
        // { title: 'Inventory Levels', value: 20, icon: 'storage', type: 'number', change: 100 },
        // { title: 'Top Seller', value: 'PS5', icon: 'star_rate', type: 'string', change: -15 },
    ];

    chartConfigs: ChartConfig[] = [
        {
            type: 'bar',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [5, 10, 15] },
            title: 'Monthly Sales',
            component: 'BarChartComponent'
        },
        {
            type: 'line',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [3, 6, 9] },
            title: 'Quarterly Revenue',
            component: 'LineChartComponent'
        },
        {
            type: 'pie',
            data: [{ name: 'Item A', value: 30 }, { name: 'Item B', value: 70 }],
            title: 'Market Share',
            component: 'PieChartComponent'
        },
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

    dashboard!: Array<DashboardItem>;

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
            compactType: CompactType.CompactUp,
            margin: 30,
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

    async dashData() {
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
                this.dashboardData.inventoryLevels = parseFloat((((dashboardData.inventoryLevels - baselineValues.inventoryLevels) / baselineValues.inventoryLevels) * 100).toFixed(2));
                this.dashboardData.avgFulfillmentTime = dashboardData.avgFulfillmentTime;
                this.dashboardData.topSeller = dashboardData.topSeller;
                // this.dashboardData.



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
                console.log('Processed dashboard data:', dashboardData);
            } else {
                console.error('Error fetching dashboard data:', responseBody.body);
                
            }
        } catch (error) {
            console.error('Error in dashboardData:', error);
            
        }
        finally {
            // this..isLoading = false;
        }
    }

    isLoading: boolean = false;
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
        this.titleService.updateTitle('Dashboard');
        // this.isLoading = true;

        // try {
            // await this.loadInventoryData();
            await this.fetchUsers();
            await this.dashData();
            await this.loadOrdersData();
            await this.loadStockData();
            this.RequestOrders = await this.populateRequestOrders(this.stockRequest, this.orders);

            // Update cardData with the fetched information
            this.updateCardData();

            this.initializeDashboard();
        // } catch (error) {
        //     console.error('Error initializing dashboard:', error);
        // } finally {
        //     // this.isLoading = false;
        //     this.cdr.detectChanges();
        // }
    }

    updateCardData() {
        this.cardData = [
            {
                title: 'Avg Fulfillment Time',
                value: this.dashboardData.avgFulfillmentTime || 0,
                icon: 'hourglass_full',
                type: 'number',
                change: this.calculateChange(this.dashboardData.avgFulfillmentTime, this.dashboardData.baselineValues.fulfillmentDays)
            },
            {
                title: 'Backorders',
                value: this.RequestOrders.backorders.currentBackorders || 0,
                icon: 'assignment_return',
                type: 'number',
                change: this.calculateChange(this.RequestOrders.backorders.currentBackorders, this.dashboardData.baselineValues.backorders)
            },
            {
                title: 'Inventory Levels',
                value: this.dashboardData.inventoryLevels || 0,
                icon: 'storage',
                type: 'number',
                change: this.calculateChange(this.dashboardData.inventoryLevels, this.dashboardData.baselineValues.inventoryLevels)
            },
            {
                title: 'Top Seller',
                value: this.dashboardData.topSeller || 'N/A',
                icon: 'star_rate',
                type: 'string',
                change: 0 // You might want to calculate this based on some criteria
            },
        ];
    }

    calculateChange(currentValue: number, baselineValue: number): number {
        if (baselineValue === 0) return 0;
        return parseFloat((((currentValue - baselineValue) / baselineValue) * 100).toFixed(2));
    }

    toggleDeleteMode() {
        this.isDeleteMode = !this.isDeleteMode;
    }

    deleteWidget(item: GridsterItem) {
        const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
            width: '300px',
            data: { itemName: item['name'] }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dashboard = this.dashboard.filter(dashboardItem => dashboardItem !== item);
                this.isDeleteMode = false;
            }
        });
    }

    openSidepanel() {
        this.isSidepanelOpen = true;
    }

    closeSidepanel() {
        this.isSidepanelOpen = false;
    }


    addWidget(chartConfig: any) {
        const newItem: GridsterItem = {
            cols: 6,
            rows: 2,
            y: 0,
            x: 0,
            cardId: chartConfig.title.toLowerCase().replace(' ', '-'),
            name: chartConfig.title,
            component: chartConfig.component,
            chartConfig: chartConfig
        };
        this.dashboard.push(newItem);
        this.closeSidepanel();
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
                    rows: 4,
                    y: 2,
                    x: 0,
                    cardId: 'sales-chart',
                    name: 'Sales Chart',
                    component: 'SaleschartComponent'
                },
                // Second full-width item
                {
                    cols: 12,
                    rows: 4,
                    y: 4,
                    x: 0,
                    cardId: 'bar-chart',
                    name: 'Bar Chart',
                    component: 'BarchartComponent'
                },
                // First half-width item
                {
                    cols: 6,
                    rows: 3,
                    y: 6,
                    x: 0,
                    cardId: 'bubble-chart',
                    name: 'Bubble Chart',
                    component: 'BubblechartComponent'
                },
                // Second half-width item
                {
                    cols: 6,
                    rows: 3,
                    y: 6,
                    x: 6,
                    cardId: 'donut-chart',
                    name: 'Donut Chart',
                    component: 'DonutchartComponent'
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
                    return new Intl.NumberFormat('af', {
                        style: 'currency',
                        currency: 'ZAR',
                    }).format(value);
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
