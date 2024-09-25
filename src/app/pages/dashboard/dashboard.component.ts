import { Component, OnInit, ChangeDetectorRef, Type, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TitleService } from '../../components/header/title.service';
import { MaterialModule } from '../../components/material/material.module';
import { CommonModule } from '@angular/common';
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
import { LoadingService } from '../../components/loader/loading.service';
import { HttpClientModule } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { Amplify } from 'aws-amplify';
import outputs from '../../../../amplify_outputs.json';
import { MatDialog } from '@angular/material/dialog';
import { TemplatechartComponent } from 'app/components/charts/templatechart/templatechart.component';
import { LoadingSpinnerComponent } from 'app/components/loader/loading-spinner.component';
import { DeleteConfirmationModalComponent } from './deleteWidget';
import { BarChartComponent } from 'app/components/charts/widgets/widgetBar';
import { LineChartComponent } from 'app/components/charts/widgets/widgetLine';
import { PieChartComponent } from 'app/components/charts/widgets/widgetPie';
import { BubbleChartComponent } from 'app/components/charts/widgets/widgetBubble';
import { LineBarComponent } from 'app/components/charts/line-bar/line-bar.component';
import { RadarComponent } from 'app/components/charts/radar/radar.component';
import { ScatterplotComponent } from 'app/components/charts/scatterplot/scatterplot.component';
import { DonutTemplateComponent } from 'app/components/charts/donuttemplate/donuttemplate.component';
import { AddWidgetSidePaneComponent } from '../../components/add-widget-side-pane/add-widget-side-pane.component';
import { CardData, ChartConfig, DashboardItem, DashboardService } from '../dashboard/dashboard.service';
import { ChangeDetectionService } from './change-detection.service';
import { DataCollectionService } from '../../components/add-widget-side-pane/data-collection.service';
import { MetricCardComponent } from '../../components/charts/widgets/metric-card.component';
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
        BarChartComponent,
        AddWidgetSidePaneComponent,
        BubbleChartComponent,
        MetricCardComponent,
        LineBarComponent,
        RadarComponent,
        DonutTemplateComponent,
        ScatterplotComponent,
    ],
})
export class DashboardComponent implements OnInit {
    @ViewChild('sidenav') sidenav!: MatSidenav;

    isDeleteMode = false;
    isSidepanelOpen = false;
    isLoading = true;
    Math: any;

    cardData: CardData[] = [];
    chartConfigs: any[] = [];
    dashboard: Array<DashboardItem> = [];
    options!: GridsterConfig;
    rowData: any[] = [];

    charts: { [key: string]: Type<any> } = {
        SaleschartComponent: SaleschartComponent,
        BarchartComponent: BarchartComponent,
        BubblechartComponent: BubblechartComponent,
        DonutchartComponent: DonutchartComponent,
        BarChartComponent: BarChartComponent,
        LineChartComponent: LineChartComponent,
        PieChartComponent: PieChartComponent,
        BubbleChartComponent: BubbleChartComponent,
        MetricCardComponent: MetricCardComponent,
    };

    public chartOptions!: AgChartOptions;

    constructor(
        private loader: LoadingService,
        private titleService: TitleService,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog,
        private dashService: DashboardService,
        private CDRService: ChangeDetectionService,
        private dataCollectionService: DataCollectionService,
    ) {
        Amplify.configure(outputs);
        this.initializeGridsterOptions();
    }

    async ngOnInit() {
        this.titleService.updateTitle('Dashboard');
        this.CDRService.setChangeDetectorRef(this.cdr);
        this.setupDashboardSubscription();
        await this.loadState();
        this.refreshDashboard();
    }

    private setupDashboardSubscription() {
        this.dashService.dashboard$.pipe(debounceTime(500)).subscribe((dashboard) => {
            this.dashboard = dashboard;
            this.CDRService.detectChanges();
            this.dashService.persistState(this.dashboard);
        });
    }

    private initializeGridsterOptions() {
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
            itemChangeCallback: () => this.dashService.saveState(),
            itemResizeCallback: () => this.dashService.saveState(),
            draggable: {
                enabled: true,
                stop: () => this.dashService.saveState(),
            },
            resizable: {
                enabled: true,
                stop: () => this.dashService.saveState(),
            },
            swap: true,
            pushItems: false,
            disablePushOnDrag: false,
            disablePushOnResize: false,
            pushDirections: { north: true, east: true, south: true, west: true },
            pushResizeItems: false,
            disableWindowResize: false,
            disableWarnings: false,
            scrollToNewItems: false,
        };
        this.dashService
            .getTrigger()
            .pipe(
                debounceTime(500), // Debounce for 500ms
            )
            .subscribe(() => {
                this.dashService.persistState(this.dashboard);
            });
    }

    // async populateRequestOrders(stockRequests: StockRequest[], orders: Order[]): Promise<any> {
    //     const session = await fetchAuthSession();
    //     this.loader.setLoading(false);

    //     const cognitoClient = new CognitoIdentityProviderClient({
    //         region: outputs.auth.aws_region,
    //         credentials: session.credentials,
    //     });

    //     const getUserCommand = new GetUserCommand({
    //         AccessToken: session.tokens?.accessToken.toString(),
    //     });
    //     const getUserResponse = await cognitoClient.send(getUserCommand);

    //     const tenantId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;
    //     // Filter stock requests by tenantId
    //     const filteredStockRequests = stockRequests.filter((request) => request.tenentId === tenantId);

    //     // Calculate requests data
    //     const skuCounts: SkuCounts = filteredStockRequests.reduce((counts, request) => {
    //         counts[request.sku] = (counts[request.sku] || 0) + request.quantityRequested;
    //         return counts;
    //     }, {} as SkuCounts);

    //     const totalRequests: number = Object.values(skuCounts).reduce((sum, count) => sum + count, 0);
    //     const highestRequest: number = Math.max(...Object.values(skuCounts));
    //     const mostRequestedEntry = Object.entries(skuCounts).reduce((a, b) => (a[1] > b[1] ? a : b));
    //     const mostRequestedSku = mostRequestedEntry[0];
    //     const mostRequestedPercentage = (skuCounts[mostRequestedSku] / totalRequests) * 100;

    //     // Calculate backorders data
    //     const backorders = orders.filter(
    //         (order) =>
    //             order.tenentId === tenantId &&
    //             order.Order_Status === 'Pending Approval' &&
    //             order.Expected_Delivery_Date,
    //     );
    //     const currentBackorders = backorders.length;

    //     const delays = backorders.map((order) => this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!));
    //     const totalDelay = delays.reduce((sum, delay) => sum + delay, 0);
    //     const averageDelay = currentBackorders > 0 ? totalDelay / currentBackorders : 0;

    //     const longestDelay = Math.max(...delays);
    //     const longestBackorderItem = backorders.find(
    //         (order) => this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!) === longestDelay,
    //     );

    //     // Populate RequestOrders
    //     this.RequestOrders = {
    //         requests: {
    //             totalRequests,
    //             mostRequested: {
    //                 name: mostRequestedSku || 'None found',
    //                 percentage: Number(mostRequestedPercentage.toFixed(2)) || 0,
    //             },
    //             highestRequest,
    //         },
    //         backorders: {
    //             currentBackorders,
    //             averageDelay: Number(averageDelay.toFixed(2)),
    //             longestBackorderItem: {
    //                 productName: longestBackorderItem?.Selected_Supplier || 'None found',
    //                 delay: longestDelay > 0 ? this.formatDelay(longestDelay) : '',
    //             },
    //         },
    //     };

    //     console.log('Populated RequestOrders:', this.RequestOrders);
    // }

    // private calculateDelay(orderDate: string, expectedDate: string): number {
    //     const order = new Date(orderDate);
    //     const expected = new Date(expectedDate);
    //     return Math.max(0, (expected.getTime() - order.getTime()) / (1000 * 60 * 60 * 24));
    // }

    // private formatDelay(delay: number): string {
    //     return delay > 0 ? `${delay.toFixed(0)} days` : '';
    // }

    // async loadInventoryData() {
    //     try {
    //         const session = await fetchAuthSession();
    //         this.loader.setLoading(false);

    //         const cognitoClient = new CognitoIdentityProviderClient({
    //             region: outputs.auth.aws_region,
    //             credentials: session.credentials,
    //         });

    //         const getUserCommand = new GetUserCommand({
    //             AccessToken: session.tokens?.accessToken.toString(),
    //         });
    //         const getUserResponse = await cognitoClient.send(getUserCommand);

    //         const tenantId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

    //         if (!tenantId) {
    //             console.error('TenantId not found in user attributes');
    //             this.rowData = [];
    //             return;
    //         }

    //         this.inventoryService.getInventoryItems(tenantId).subscribe(
    //             (inventoryItems) => {
    //                 this.inventory = inventoryItems;
    //                 console.log('Processed inventory items:', this.inventory);
    //             },
    //             (error) => {
    //                 console.error('Error fetching inventory data:', error);
    //                 this.rowData = [];
    //             },
    //         );
    //     } catch (error) {
    //         console.error('Error in loadInventoryData:', error);
    //         this.rowData = [];
    //     } finally {
    //         this.isLoading = false;
    //     }
    // }

    // async loadOrdersData() {
    //     // this.isLoading = true;
    //     try {
    //         const session = await fetchAuthSession();

    //         const cognitoClient = new CognitoIdentityProviderClient({
    //             region: outputs.auth.aws_region,
    //             credentials: session.credentials,
    //         });

    //         const getUserCommand = new GetUserCommand({
    //             AccessToken: session.tokens?.accessToken.toString(),
    //         });
    //         const getUserResponse = await cognitoClient.send(getUserCommand);

    //         const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

    //         if (!tenentId) {
    //             console.error('TenentId not found in user attributes');
    //             this.rowData = [];
    //             return;
    //         }

    //         const lambdaClient = new LambdaClient({
    //             region: outputs.auth.aws_region,
    //             credentials: session.credentials,
    //         });

    //         const invokeCommand = new InvokeCommand({
    //             FunctionName: 'getOrders',
    //             Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
    //         });

    //         const lambdaResponse = await lambdaClient.send(invokeCommand);
    //         const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
    //         console.log('Response from Lambda:', responseBody);

    //         if (responseBody.statusCode === 200) {
    //             const orders = JSON.parse(responseBody.body);
    //             this.orders = orders;
    //             console.log('Processed orders from orders:', orders);
    //         } else {
    //             console.error('Error fetching orders data:', responseBody.body);
    //             this.rowData = [];
    //         }
    //     } catch (error) {
    //         console.error('Error in loadOrdersData:', error);
    //         this.rowData = [];
    //     } finally {
    //         // this..isLoading = false;
    //     }
    // }

    // async loadStockData() {
    //     // this.isLoading = true;
    //     try {
    //         const session = await fetchAuthSession();

    //         const cognitoClient = new CognitoIdentityProviderClient({
    //             region: outputs.auth.aws_region,
    //             credentials: session.credentials,
    //         });

    //         const getUserCommand = new GetUserCommand({
    //             AccessToken: session.tokens?.accessToken.toString(),
    //         });
    //         const getUserResponse = await cognitoClient.send(getUserCommand);

    //         const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;
    //         // const tenentId = '1718890159961-q85m9';

    //         if (!tenentId) {
    //             console.error('TenentId not found in user attributes');
    //             // this.rowData = [];
    //             return;
    //         }

    //         const lambdaClient = new LambdaClient({
    //             region: outputs.auth.aws_region,
    //             credentials: session.credentials,
    //         });

    //         const invokeCommand = new InvokeCommand({
    //             FunctionName: 'getStockRequests',
    //             Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
    //         });

    //         const lambdaResponse = await lambdaClient.send(invokeCommand);
    //         const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
    //         console.log('Response from Lambda:', responseBody);

    //         if (responseBody.statusCode === 200) {
    //             const stock = JSON.parse(responseBody.body);
    //             this.stockRequest = stock;
    //             console.log('Processed stock requests:', stock);
    //         } else {
    //             console.error('Error fetching orders data:', responseBody.body);
    //             // this.rowData = [];
    //         }
    //     } catch (error) {
    //         console.error('Error in loadOrdersData:', error);
    //         // this.rowData = [];
    //     } finally {
    //         // this..isLoading = false;
    //     }
    // }

    // async fetchUsers() {
    //     try {
    //         const session = await fetchAuthSession();

    //         const lambdaClient = new LambdaClient({
    //             region: outputs.auth.aws_region,
    //             credentials: session.credentials,
    //         });

    //         // Retrieve the custom attribute using GetUserCommand
    //         const client = new CognitoIdentityProviderClient({
    //             region: outputs.auth.aws_region,
    //             credentials: session.credentials,
    //         });

    //         const getUserCommand = new GetUserCommand({
    //             AccessToken: session.tokens?.accessToken.toString(),
    //         });
    //         const getUserResponse = await client.send(getUserCommand);

    //         const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
    //             (attr) => attr.Name === 'custom:tenentId',
    //         )?.Value;

    //         const payload = JSON.stringify({
    //             userPoolId: outputs.auth.user_pool_id,
    //             tenentId: adminUniqueAttribute,
    //         });

    //         const invokeCommand = new InvokeCommand({
    //             FunctionName: 'getUsers',
    //             Payload: new TextEncoder().encode(payload),
    //         });

    //         const lambdaResponse = await lambdaClient.send(invokeCommand);
    //         const users = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
    //         // console.log('Users received from Lambda:', users);

    //         this.userCount = Array.isArray(users) ? users.length : 0;
    //         console.log('Number of users received:', this.userCount);
    //     } catch (error) {
    //         console.error('Error fetching users:', error);
    //         this.userCount = 0; // Ensure user count is set to 0 in case of errors
    //     } finally {
    //         // this..isLoading = false;
    //     }
    // }

    // private async fetchAllData() {
    //     await Promise.all([this.loadInventoryData(), this.fetchUsers(), this.loadOrdersData(), this.loadStockData()]);
    // }

    // async updateChartConfigs() {
    //     try {
    //         const data = await this.service.getMonthlyRequest();
    //         if (data) {
    //             this.chartConfigs = [
    //                 {
    //                     type: 'bar',
    //                     data: {
    //                         categories: [
    //                             'Jan',
    //                             'Feb',
    //                             'Mar',
    //                             'Apr',
    //                             'May',
    //                             'Jun',
    //                             'Jul',
    //                             'Aug',
    //                             'Sep',
    //                             'Oct',
    //                             'Nov',
    //                             'Dec',
    //                         ],
    //                         values: data.monthlySales,
    //                     },
    //                     title: 'Monthly Sales',
    //                     component: 'BarChartComponent',
    //                 },
    //                 {
    //                     type: 'line',
    //                     data: {
    //                         categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    //                         values: data.quarterlyRevenue,
    //                     },
    //                     title: 'Quarterly Revenue',
    //                     component: 'LineChartComponent',
    //                 },
    //                 {
    //                     type: 'pie',
    //                     data: Object.entries(data.marketShare).map(([name, value]) => ({ name, value })),
    //                     title: 'Market Share',
    //                     component: 'PieChartComponent',
    //                 },
    //             ];
    //         } else {
    //             console.error('Failed to fetch data from the service');
    //         }
    //     } catch (error) {
    //         console.error('Error updating chart configs:', error);
    //     }
    // }

    loadState() {
        try {
            const savedState = this.dashService.getState();
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                if (Array.isArray(parsedState)) {
                    this.dashboard = parsedState;
                } else {
                    console.error('Saved state is not an array, initializing default dashboard');
                    this.dashboard = this.initializeDashboard();
                }
            } else {
                this.dashboard = this.initializeDashboard();
            }
        } catch (error) {
            console.error('Error loading dashboard state:', error);
            this.initializeDashboard();
        }
    }

    // processDashboardData() {
    //     this.dashboardData = this.service.processDashboardData(this.orders, this.stockRequest, this.inventory);
    //     this.calculateMetricPerformance();
    // }

    // calculateMetricPerformance() {
    //     if (!this.dashboardData || !this.dashboardData.metricConfigs) {
    //         console.error('Dashboard data or metric configs are missing');
    //         return;
    //     }

    //     const metrics = ['avgFulfillmentTime', 'backorders', 'inventoryLevels'];
    //     metrics.forEach((metric) => {
    //         const config = this.dashboardData.metricConfigs[metric];
    //         if (!config) {
    //             console.warn(`Config for metric ${metric} is missing`);
    //             return;
    //         }

    //         let currentValue = this.dashboardData[metric];
    //         if (currentValue === undefined) {
    //             console.warn(`Value for metric ${metric} is missing`);
    //             return;
    //         }

    //         if (metric === 'avgFulfillmentTime') {
    //             currentValue = this.parseTimeToHours(currentValue);
    //         }

    //         let percentageChange =
    //             config.baseline !== 0 ? ((currentValue - config.baseline) / config.baseline) * 100 : 0;
    //         if (config.isInverted) {
    //             percentageChange = -percentageChange;
    //         }

    //         let color: 'green' | 'yellow' | 'red';
    //         if (percentageChange >= config.goodThreshold) {
    //             color = 'green';
    //         } else if (percentageChange <= config.badThreshold) {
    //             color = 'red';
    //         } else {
    //             color = 'yellow';
    //         }

    //         this.metricPerformance[metric] = {
    //             value: this.dashboardData[metric],
    //             percentageChange: Number(percentageChange.toFixed(2)),
    //             color,
    //         };
    //     });

    //     // Handle topSeller separately
    //     if (this.dashboardData.topSeller && this.dashboardData.topSellerPercentage !== undefined) {
    //         this.metricPerformance['topSeller'] = {
    //             value: `${this.dashboardData.topSeller} (${this.dashboardData.topSellerPercentage.toFixed(1)}%)`,
    //             percentageChange: this.dashboardData.topSellerPercentage,
    //             color: 'green', // You might want to implement a different logic for color here
    //         };
    //     } else {
    //         console.warn('Top seller data is missing');
    //     }
    // }

    // updateCardData() {
    //     this.cardData = [
    //         {
    //             title: 'Avg Fulfillment Time',
    //             value: this.dashboardData.avgFulfillmentTime,
    //             icon: 'hourglass_full',
    //             type: 'string',
    //             change: this.metricPerformance['avgFulfillmentTime'].percentageChange,
    //             color: this.metricPerformance['avgFulfillmentTime'].color,
    //         },
    //         {
    //             title: 'Backorders',
    //             value: this.dashboardData.backorders,
    //             icon: 'assignment_return',
    //             type: 'number',
    //             change: this.metricPerformance['backorders'].percentageChange,
    //             color: this.metricPerformance['backorders'].color,
    //         },
    //         {
    //             title: 'Inventory Levels',
    //             value: this.dashboardData.inventoryLevels,
    //             icon: 'storage',
    //             type: 'number',
    //             change: this.metricPerformance['inventoryLevels'].percentageChange,
    //             color: this.metricPerformance['inventoryLevels'].color,
    //         },
    //         {
    //             title: 'Most Requested',
    //             value: `${this.dashboardData.topSeller}`,
    //             icon: 'star_rate',
    //             type: 'string',
    //             change: this.metricPerformance['topSeller'].percentageChange,
    //             color: this.metricPerformance['topSeller'].color,
    //         },
    //     ];
    // }

    // calculateTimeChange(currentValue: string, baselineValue: string): number {
    //     const current = this.parseTimeToHours(currentValue);
    //     const baseline = this.parseTimeToHours(baselineValue);

    //     if (baseline === 0) return 0;
    //     return parseFloat((((current - baseline) / baseline) * 100).toFixed(2));
    // }

    // parseTimeToHours(value: string): number {
    //     const parts = value.split(' ');
    //     let hours = 0;
    //     for (let i = 0; i < parts.length; i += 2) {
    //         const amount = parseInt(parts[i], 10);
    //         const unit = parts[i + 1].toLowerCase();
    //         if (unit.startsWith('day')) {
    //             hours += amount * 24;
    //         } else if (unit.startsWith('hr')) {
    //             hours += amount;
    //         }
    //     }
    //     return hours;
    // }

    // calculateChange(currentValue: number, baselineValue: number): number {
    //     if (baselineValue === 0) return currentValue > 0 ? 100 : 0;
    //     return parseFloat((((currentValue - baselineValue) / baselineValue) * 100).toFixed(2));
    // }

    toggleDeleteMode() {
        this.isDeleteMode = !this.isDeleteMode;
    }

    deleteWidget(item: GridsterItem) {
        const dialogRef = this.dialog.open(DeleteConfirmationModalComponent, {
            width: '300px',
            data: { itemName: item['name'] },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.dashboard = this.dashService.removeWidget(item);
                this.isDeleteMode = false;
            }
        });
    }

    openSidepanel() {
        this.isSidepanelOpen = true;
    }

    addWidget(chartConfig: ChartConfig) {
        this.dashService.addWidget(chartConfig);
        this.isSidepanelOpen = false;
    }

    initializeDashboard() {
        this.cardData = [
            {
                title: 'Total Revenue',
                value: 1250000,
                icon: 'attach_money',
                type: 'currency',
                change: 15.2,
                color: 'green',
            },
            {
                title: 'New Customers',
                value: 847,
                icon: 'person_add',
                type: 'number',
                change: 5.6,
                color: 'green',
            },
            {
                title: 'Customer Satisfaction',
                value: 92,
                icon: 'sentiment_satisfied',
                type: 'percentage',
                change: -2.1,
                color: 'yellow',
            },
            {
                title: 'Orders Processed',
                value: 1532,
                icon: 'shopping_cart',
                type: 'number',
                change: 8.3,
                color: 'green',
            },
        ];
        this.dashboard = [
            // Existing cards
            // ...this.cardData.map((data, index) => ({
            //     cols: 3,
            //     rows: 1,
            //     y: 0,
            //     x: index * 3,
            //     cardData: data,
            // })),
            // First full-width item
            // {
            //     cols: 12,
            //     rows: 3,
            //     y: 2,
            //     x: 0,
            //     cardId: 'sales-chart',
            //     name: 'Sales Chart',
            //     component: 'SaleschartComponent',
            // },
            // // Second full-width item(0)
            // {
            //     cols: 12,
            //     rows: 3,
            //     y: 4,
            //     x: 0,
            //     cardId: 'bar-chart',
            //     name: 'Bar Chart',
            //     component: 'BarchartComponent',
            // },
            // // First half-width item
            // {
            //     cols: 6,
            //     rows: 3,
            //     y: 6,
            //     x: 0,
            //     cardId: 'bubble-chart',
            //     name: 'Bubble Chart',
            //     component: 'BubblechartComponent',
            // },
            // // Second half-width item
            // {
            //     cols: 6,
            //     rows: 4,
            //     y: 6,
            //     x: 6,
            //     cardId: 'donut-chart',
            //     name: 'Donut Chart',
            //     component: 'DonutchartComponent',
            // },
        ];
        this.CDRService.detectChanges();
        return this.dashboard;
    }

    getColor(color: string): string {
        const colorMap: { [key: string]: string } = {
            green: 'text-green-500',
            red: 'text-red-500',
            yellow: 'text-yellow-500',
        };
        return colorMap[color] || 'text-gray-500';
    }

    getIcon(change: number | undefined): string {
        return change === undefined ? 'remove' : change >= 0 ? 'arrow_upward' : 'arrow_downward';
    }

    formatValue(value: number | string, type: string): string {
        if (typeof value === 'number') {
            if (type === 'currency') {
                return new Intl.NumberFormat('af', { style: 'currency', currency: 'ZAR' }).format(value);
            }
            return value.toString();
        }
        return value;
    }

    getProgressRingStyle(change: number, color: string): string {
        const absChange = Math.abs(change);
        const degree = (absChange / 100) * 360;
        return `conic-gradient(${this.getColorHex(color)} 0deg ${degree}deg, #f0f0f0 ${degree}deg 360deg)`;
    }

    getColorHex(color: string): string {
        const colorMap: { [key: string]: string } = {
            green: '#4CAF50',
            red: '#F44336',
            yellow: '#FFC107',
        };
        return colorMap[color] || '#9E9E9E';
    }

    getChangeColor(change: number): string {
        return change >= 0 ? 'positive-change' : 'negative-change';
    }

    refreshDashboard() {
        this.isLoading = true;
        this.dataCollectionService.generateChartConfigs().subscribe({
            next: (chartConfigs) => {
                this.updateDashboardWidgets(chartConfigs);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error refreshing dashboard:', error);
                this.isLoading = false;
            },
        });
    }

    updateDashboardWidgets(newChartConfigs: ChartConfig[]) {
        this.dashboard = this.dashboard.map((item) => {
            const updatedConfig = newChartConfigs.find((config) => config.title === item.name);
            if (updatedConfig) {
                return {
                    ...item,
                    chartConfig: updatedConfig,
                };
            }
            return item;
        });

        this.dashService.updateDashboard(this.dashboard);
        this.CDRService.detectChanges();
    }
}
