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
import { DataServiceService } from './data-service.service';
interface CardData {
    title: string;
    value: string | number;
    icon: string;
    type: 'currency' | 'number' | 'percentage' | 'string';
    change?: number;
    color: string;
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
    backorders: number;
    baselineValues: {
        fulfillmentDays: number;
        backorders: number;
        inventoryLevels: number;
    };
}


interface MetricPerformance {
    value: number | string;
    percentageChange: number;
    color: 'green' | 'yellow' | 'red';
}

interface StockRequest {
    tenentId: string;
    sku: string;
    quantityRequested: number;
}

interface Order {
    tenentId: string;
    Order_Status: string;
    Expected_Delivery_Date: string | null;
    Order_Date: string;
    Selected_Supplier?: string;
}

interface SkuCounts {
    [sku: string]: number;
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
    metricPerformance: Record<string, MetricPerformance> = {};
    dashboardData: any;
    inventoryCount: number = 0;
    userCount: number = 0;

    options: GridsterConfig;
    stockRequest: any[] = [];
    inventory: any[] = [];
    orders: any[] = [];

    cardData: CardData[] = [];

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
        private dialog: MatDialog,
        private service: DataServiceService
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

    async populateRequestOrders(stockRequests: StockRequest[], orders: Order[]): Promise<any> {
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
        // Filter stock requests by tenantId
        const filteredStockRequests = stockRequests.filter(request => request.tenentId === tenantId);

        // Calculate requests data
        const skuCounts: SkuCounts = filteredStockRequests.reduce((counts, request) => {
            counts[request.sku] = (counts[request.sku] || 0) + request.quantityRequested;
            return counts;
        }, {} as SkuCounts);

        const totalRequests: number = Object.values(skuCounts).reduce((sum, count) => sum + count, 0);
        const highestRequest: number = Math.max(...Object.values(skuCounts));
        const mostRequestedEntry = Object.entries(skuCounts).reduce((a, b) => a[1] > b[1] ? a : b);
        const mostRequestedSku = mostRequestedEntry[0];
        const mostRequestedPercentage = (skuCounts[mostRequestedSku] / totalRequests) * 100;

        // Calculate backorders data
        const backorders = orders.filter(order =>
            order.tenentId === tenantId &&
            order.Order_Status === "Pending Approval" &&
            order.Expected_Delivery_Date
        );
        const currentBackorders = backorders.length;

        const delays = backorders.map(order => this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!));
        const totalDelay = delays.reduce((sum, delay) => sum + delay, 0);
        const averageDelay = currentBackorders > 0 ? totalDelay / currentBackorders : 0;

        const longestDelay = Math.max(...delays);
        const longestBackorderItem = backorders.find(order =>
            this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!) === longestDelay
        );

        // Populate RequestOrders
        this.RequestOrders = {
            requests: {
                totalRequests,
                mostRequested: {
                    name: mostRequestedSku || "None found",
                    percentage: Number(mostRequestedPercentage.toFixed(2)) || 0
                },
                highestRequest
            },
            backorders: {
                currentBackorders,
                averageDelay: Number(averageDelay.toFixed(2)),
                longestBackorderItem: {
                    productName: longestBackorderItem?.Selected_Supplier || 'None found',
                    delay: longestDelay > 0 ? this.formatDelay(longestDelay) : ''
                }
            }
        };

        console.log('Populated RequestOrders:', this.RequestOrders);
    }
    // Helper methods (make sure these are part of your component)
    private calculateDelay(orderDate: string, expectedDate: string): number {
        const order = new Date(orderDate);
        const expected = new Date(expectedDate);
        return Math.max(0, (expected.getTime() - order.getTime()) / (1000 * 60 * 60 * 24));
    }

    private formatDelay(delay: number): string {
        return delay > 0 ? `${delay.toFixed(0)} days` : "";
    }
    // Integration
    inventoryLevel: number = 20;


    async loadInventoryData() {
        try {
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
                FunctionName: 'Inventory-getItems',
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
                const inventoryItems = JSON.parse(responseBody.body);
                this.inventory = inventoryItems;
                console.log('Processed inventory items:', this.rowData);
            } else {
                console.error('Error fetching inventory data:', responseBody.body);
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
        }
    }

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
                // console.log('I am a metric', parseFloat((((dashboardData.inventoryLevels - baselineValues.inventoryLevels) / baselineValues.inventoryLevels) * 100).toFixed(2)));
                this.dashboardData.inventoryLevels = parseFloat((((dashboardData.inventoryLevels - baselineValues.inventoryLevels) / baselineValues.inventoryLevels) * 100).toFixed(2));
                this.dashboardData.avgFulfillmentTime = dashboardData.avgFulfillmentTime;
                this.dashboardData.topSeller = dashboardData.topSeller;
                this.dashboardData.backorders = dashboardData.backorders;
                // this.dashboardData.
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
                console.log('Processed orders from orders:', orders);

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
                const stock = JSON.parse(responseBody.body);
                this.stockRequest = stock;
                console.log('Processed stock requests:', stock);
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
        await this.loadInventoryData();
        await this.fetchUsers();
        // await this.dashData();
        await this.loadOrdersData();
        await this.loadStockData();
        this.processDashboardData();
        this.populateRequestOrders(this.stockRequest, this.orders);
        // this.RequestOrders = await this.populateRequestOrders(this.stockRequest, this.orders);

        // Update cardData with the fetched information
        this.updateCardData();

        this.initializeDashboard();
    }

    processDashboardData() {
        this.dashboardData = this.service.processDashboardData(
            this.orders,
            this.stockRequest,
            this.inventory
        );
        this.calculateMetricPerformance();
    }

    calculateMetricPerformance() {
        if (!this.dashboardData || !this.dashboardData.metricConfigs) {
            console.error('Dashboard data or metric configs are missing');
            return;
        }

        const metrics = ['avgFulfillmentTime', 'backorders', 'inventoryLevels'];
        metrics.forEach(metric => {
            const config = this.dashboardData.metricConfigs[metric];
            if (!config) {
                console.warn(`Config for metric ${metric} is missing`);
                return;
            }

            let currentValue = this.dashboardData[metric];
            if (currentValue === undefined) {
                console.warn(`Value for metric ${metric} is missing`);
                return;
            }

            if (metric === 'avgFulfillmentTime') {
                currentValue = this.parseTimeToHours(currentValue);
            }

            let percentageChange = config.baseline !== 0
                ? ((currentValue - config.baseline) / config.baseline) * 100
                : 0;
            if (config.isInverted) {
                percentageChange = -percentageChange;
            }

            let color: 'green' | 'yellow' | 'red';
            if (percentageChange >= config.goodThreshold) {
                color = 'green';
            } else if (percentageChange <= config.badThreshold) {
                color = 'red';
            } else {
                color = 'yellow';
            }

            this.metricPerformance[metric] = {
                value: this.dashboardData[metric],
                percentageChange: Number(percentageChange.toFixed(2)),
                color
            };
        });

        // Handle topSeller separately
        if (this.dashboardData.topSeller && this.dashboardData.topSellerPercentage !== undefined) {
            this.metricPerformance['topSeller'] = {
                value: `${this.dashboardData.topSeller} (${this.dashboardData.topSellerPercentage.toFixed(1)}%)`,
                percentageChange: this.dashboardData.topSellerPercentage,
                color: 'green' // You might want to implement a different logic for color here
            };
        } else {
            console.warn('Top seller data is missing');
        }
    }

    updateCardData() {
        this.cardData = [
            {
                title: 'Avg Fulfillment Time',
                value: this.dashboardData.avgFulfillmentTime,
                icon: 'hourglass_full',
                type: 'string',
                change: this.metricPerformance['avgFulfillmentTime'].percentageChange,
                color: this.metricPerformance['avgFulfillmentTime'].color
            },
            {
                title: 'Backorders',
                value: this.dashboardData.backorders,
                icon: 'assignment_return',
                type: 'number',
                change: this.metricPerformance['backorders'].percentageChange,
                color: this.metricPerformance['backorders'].color
            },
            {
                title: 'Inventory Levels',
                value: this.dashboardData.inventoryLevels,
                icon: 'storage',
                type: 'number',
                change: this.metricPerformance['inventoryLevels'].percentageChange,
                color: this.metricPerformance['inventoryLevels'].color
            },
            {
                title: 'Top Seller',
                value: `${this.dashboardData.topSeller}`,
                icon: 'star_rate',
                type: 'string',
                change: this.metricPerformance['topSeller'].percentageChange,
                color: this.metricPerformance['topSeller'].color
            },
        ];
    }

    calculateTimeChange(currentValue: string, baselineValue: string): number {
        const current = this.parseTimeToHours(currentValue);
        const baseline = this.parseTimeToHours(baselineValue);

        if (baseline === 0) return 0;
        return parseFloat((((current - baseline) / baseline) * 100).toFixed(2));
    }

    parseTimeToHours(value: string): number {
        const parts = value.split(' ');
        let hours = 0;
        for (let i = 0; i < parts.length; i += 2) {
            const amount = parseInt(parts[i], 10);
            const unit = parts[i + 1].toLowerCase();
            if (unit.startsWith('day')) {
                hours += amount * 24;
            } else if (unit.startsWith('hr')) {
                hours += amount;
            }
        }
        return hours;
    }

    calculateChange(currentValue: number, baselineValue: number): number {
        if (baselineValue === 0) return currentValue > 0 ? 100 : 0;
        return parseFloat((((currentValue - baselineValue) / baselineValue) * 100).toFixed(2));
    }

    private parseTimeValue(value: number | string): number {
        if (typeof value === 'number') return value;

        const timeRegex = /(\d+)\s*(hrs?|hours?|days?)/i;
        const match = value.match(timeRegex);

        if (match) {
            const amount = parseInt(match[1], 10);
            const unit = match[2].toLowerCase();

            if (unit.startsWith('hr') || unit.startsWith('hour')) {
                return amount;
            } else if (unit.startsWith('day')) {
                return amount * 24; // Convert days to hours
            }
        }

        // If the string doesn't match the expected format, try parsing it as a number
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? 0 : numericValue;
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
                    rows: 3,
                    y: 2,
                    x: 0,
                    cardId: 'sales-chart',
                    name: 'Sales Chart',
                    component: 'SaleschartComponent'
                },
                // Second full-width item(0)
                {
                    cols: 12,
                    rows: 3,
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

    getColor(color: string): string {
        switch (color) {
            case 'green': return 'text-green-500';
            case 'red': return 'text-red-500';
            case 'yellow': return 'text-yellow-500';
            default: return 'text-gray-500';
        }
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

    getProgressRingStyle(change: number, color: string): string {
        const absChange = Math.abs(change);
        const degree = (absChange / 100) * 360;
        return `conic-gradient(${this.getColorHex(color)} 0deg ${degree}deg, #f0f0f0 ${degree}deg 360deg)`;
    }

    getColorHex(color: string): string {
        switch (color) {
            case 'green': return '#4CAF50';
            case 'red': return '#F44336';
            case 'yellow': return '#FFC107';
            default: return '#9E9E9E';
        }
    }


    getChangeColor(change: number): string {
        return change >= 0 ? 'positive-change' : 'negative-change';
    }
}
