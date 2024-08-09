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
import { CustomizeComponent } from '../../components/modal/customize/customize.component';
import { TemplatechartComponent } from '../../components/charts/templatechart/templatechart.component';
interface DashboardItem extends GridsterItem {
    type: string;
    cols: number;
    rows: number;
    y: number;
    x: number;
    isActive?: boolean; // This flag will control the visibility
    name?: string;
    icon?: string;
    analytic?: string;
    percentage?: number; // Ensure this is defined as a number if using the percent pipe
    component?: any;
    tooltip?: string;
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
        TemplatechartComponent
    ],
})
export class DashboardComponent implements OnInit {
    isDeleteMode: boolean = false;
    @ViewChild('sidenav') sidenav!: MatSidenav;

    openSidePanel() {
        this.sidenav.open();
    }

    closeSidePanel() {
        this.sidenav.close();
    }

    private saveTrigger = new Subject<void>();

    chartConfigs = [
        { type: 'bar', data: { categories: ['Jan', 'Feb', 'Mar'], values: [5, 10, 15] }, title: 'Monthly Sales' },
        { type: 'line', data: { categories: ['Jan', 'Feb', 'Mar'], values: [3, 6, 9] }, title: 'Quarterly Revenue' },
        { type: 'pie', data: [{ name: 'Item A', value: 30 }, { name: 'Item B', value: 70 }], title: 'Market Share' },
        { type: 'sunburst', data: [], title: 'Inventory Breakdown' } // Populate with appropriate data
    ];
    rowData: any[] = [];
    dashboardInfo: any[] = [];
    inventoryCount: number = 0;
    userCount: number = 0;

    options: GridsterConfig;
    charts: Type<any>[] = [];
    pendingDeletions: DashboardItem[] = [];
    standaloneDeletions: DashboardItem[] = [];

    RequestOrders = {
        requests: {
            totalRequests: 320,
            fulfilledRequests: {
                count: 280,
                percentage: 87.5
            },
            pendingRequests: 40,
        },
        backorders: {
            currentBackorders: 75,
            averageDelay: 8, // in days
            longestBackorderItem: {
                productName: 'Product X',
                delay: 15 // in days
            }
        }
    };

    dashboard: DashboardItem[];
    largeItem: DashboardItem = {
        cols: 4,
        rows: 4,
        y: 1,
        x: 0,
        type: 'large',
        isActive: true,
    };
    newLargeItem: DashboardItem = {
        cols: 4,
        rows: 4,
        y: 2,
        x: 0,
        type: 'newLarge',
        isActive: true,
    };
    SalesvsTarget: DashboardItem = {
        cols: 2,
        rows: 3,
        y: 2,
        x: 0,
        type: 'salesVsTarget',
        isActive: true,
    };
    Product: DashboardItem = {
        cols: 2,
        rows: 4,
        y: 2,
        x: 0,
        type: 'product',
        isActive: true,
    };

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
            draggable: {
                enabled: true,
                stop: (event) => this.saveState(),
            },
            resizable: {
                enabled: true,
                stop: (event) => this.saveState(),
            },
            pushItems: false,
            minCols: 4,
            maxCols: 4,
            minRows: 4, // Increased minimum rows for better initial height
            maxRows: 100,
            minItemWidth: 100, // Minimum width each item can shrink to
            minItemHeight: 50, // Minimum height each item can shrink to
            minItemCols: 1, // Maximum columns an item can expand to
            minItemRows: 1, // Maximum rows an item can expand to
            fixedRowHeight: 150,
            addEmptyRowsCount: 10,
        };

        this.dashboard = [];

        this.saveTrigger
            .pipe(
                debounceTime(1000) // Adjust the time based on your needs, 1000 ms is just an example
            )
            .subscribe(() => {
                this.performSaveState();
            });
    }

    // Titles for each chart
    chartTitles: { [key: string]: string } = {
        salesChart: 'Initial Sales Chart Title',
        barChart: 'Initial Bar Chart Title',
        bubbleChart: 'Initial Bubble Chart Title'
    };

    openCustomizeModal(chartType: any) {
        const dialogRef = this.dialog.open(CustomizeComponent, {
            width: '400px',
            data: {
                chartType: chartType,
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                console.log('The dialog was closed', result);
                this.updateChartConfigs(result);
            }
        });
    }

    enableDragging(item: GridsterItem) {
        item.dragEnabled = true;
    }

    disableDragging(item: GridsterItem) {
        item.dragEnabled = false;
    }

    // Integration

    async dashboardData() {
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
                console.log('Dashboard Data:', dashboardData); // Log to check the structure

                // Directly use the object to set dashboardInfo
                this.dashboardInfo = [{
                    metric: 'Inventory Levels',
                    value: dashboardData.inventoryLevels,
                    timestamp: new Date().toISOString() // Assuming current time for demo purposes
                }, {
                    metric: 'Backorders',
                    value: dashboardData.backorders,
                    timestamp: new Date().toISOString() // Assuming current time for demo purposes
                }, {
                    metric: 'Average Fulfillment Time',
                    value: dashboardData.avgFulfillmentTime,
                    timestamp: new Date().toISOString() // Assuming current time for demo purposes
                }, {
                    metric: 'Top Seller',
                    value: dashboardData.topSeller,
                    timestamp: new Date().toISOString() // Assuming current time for demo purposes
                }];
                console.log('Processed dashboard data:', this.dashboardInfo);
            } else {
                console.error('Error fetching dashboard data:', responseBody.body);
                this.dashboardInfo = [];
            }
        } catch (error) {
            console.error('Error in dashboardData:', error);
            this.dashboardInfo = [];
        }
    }


    async loadInventoryData() {
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

            if (!tenantId) {
                console.error('TenantId not found in user attributes');
                this.inventoryCount = 0; // Updated to manage count
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'Inventory-getItems',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            // console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const inventoryItems = JSON.parse(responseBody.body);
                this.inventoryCount = inventoryItems.length; // Setting the count of inventory items
                console.log('Inventory items count:', this.inventoryCount);
            } else {
                console.error('Error fetching inventory data:', responseBody.body);
                this.inventoryCount = 0; // Updated to manage count
            }
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
            this.inventoryCount = 0; // Updated to manage count
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
        }
    }



    //

    performSaveState() {
        console.log('Saving state:', this.dashboard); // Log to debug
        const state = {
            dashboard: [...this.dashboard], // Use spread to ensure a new array reference
            standaloneItems: {
                largeItem: this.largeItem,
                newLargeItem: this.newLargeItem,
                SalesvsTarget: this.SalesvsTarget,
                Product: this.Product,
            },
        };
        localStorage.setItem('dashboardState', JSON.stringify(state));
    }

    saveState() {
        this.saveTrigger.next();
    }

    loadState() {
        const savedState = localStorage.getItem('dashboardState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.dashboard = state.dashboard || this.getDefaultDashboard(); // Fallback to default
            this.largeItem = state.standaloneItems.largeItem;
            this.newLargeItem = state.standaloneItems.newLargeItem;
            this.SalesvsTarget = state.standaloneItems.SalesvsTarget;
            this.Product = state.standaloneItems.Product;
        } else {
            this.dashboard = this.getDefaultDashboard();
        }
        this.cdr.detectChanges(); // Force change detection
    }

    getDefaultDashboard(): DashboardItem[] {
        // return default dashboard setup
        this.dashboard = [
            {
                cols: 1,
                rows: 1,
                y: 0,
                x: 4,
                name: 'Inventory Levels',
                icon: 'storage',
                analytic: '1234',
                percentage: 0.04,
                type: 'card',
                isActive: true,
                tooltip: 'Current inventory stock count.',
            },
            {
                cols: 1,
                rows: 1,
                y: 0,
                x: 5,
                name: 'Backorders',
                icon: 'assignment_return',
                analytic: '320',
                percentage: -0.01,
                type: 'card',
                isActive: true,
                tooltip: 'Orders pending due to lack of stock.',
            },
            {
                cols: 1,
                rows: 1,
                y: 0,
                x: 6,
                name: 'Avg Fulfillment Time',
                icon: 'hourglass_full',
                analytic: '48 hrs',
                percentage: -0.05,
                type: 'card',
                isActive: true,
                tooltip: 'Average time taken from order placement to shipment.',
            },
            {
                cols: 1,
                rows: 1,
                y: 0,
                x: 7,
                name: 'Top Seller',
                icon: 'star_rate',
                analytic: 'Product123',
                percentage: 0.12,
                type: 'card',
                isActive: true,
                tooltip: 'The product with the highest requests.',
            },
        ];

        return this.dashboard;
    }

    toggleDeleteMode(): void {
        this.isDeleteMode = !this.isDeleteMode;
    }

    markForDeletion(item: DashboardItem, event: MouseEvent | TouchEvent): void {
        event.preventDefault();
        event.stopPropagation();

        // Determine if the item is part of the dashboard or standalone items
        if (this.dashboard.includes(item)) {
            this.toggleItemInArray(item, this.pendingDeletions);
        } else {
            this.toggleItemInArray(item, this.standaloneDeletions);
        }
    }

    toggleItemInArray(item: DashboardItem, targetArray: DashboardItem[]): void {
        const index = targetArray.indexOf(item);
        if (index === -1) {
            targetArray.push(item);
        } else {
            targetArray.splice(index, 1);
        }
    }

    removeItem(item: DashboardItem): void {
        item.isActive = false;
        this.cdr.detectChanges(); // Refresh the view to reflect the removal
    }

    toggleItemDeletion(item: DashboardItem): void {
        const index = this.pendingDeletions.indexOf(item);
        if (index > -1) {
            this.pendingDeletions.splice(index, 1); // Remove from deletions if already marked
        } else {
            this.pendingDeletions.push(item); // Add to deletions if not already marked
        }
    }

    finalizeDeletions(): void {
        this.dashboard = this.dashboard.filter((item) => !this.pendingDeletions.includes(item));
        this.pendingDeletions = [];

        // Toggle isActive for standalone items
        [this.largeItem, this.newLargeItem, this.SalesvsTarget, this.Product].forEach((item) => {
            if (this.standaloneDeletions.includes(item)) {
                item.isActive = false; // Mark as inactive instead of deleting
            }
        });

        this.standaloneDeletions = [];
        this.toggleDeleteMode();
    }

    undoDeletions(): void {
        [...this.pendingDeletions, ...this.standaloneDeletions].forEach((item) => (item.isActive = true));
        this.pendingDeletions = [];
        this.standaloneDeletions = [];
        this.toggleDeleteMode();
    }
    sidebarOpen: boolean = false;

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    addChart(type: string): void {
        let component: Type<any> | null = null;

        if (type === 'bar') {
            component = BarchartComponent;
        } else if (type === 'donut') {
            component = DonutchartComponent;
        } else if (type === 'area') {
            component = SaleschartComponent;
        }

        if (component) {
            // Calculate new position, assume each card takes 1 column and starts at row 0
            const positionX = this.dashboard.length % 4; // This will place new chart in next available column
            const positionY = Math.floor(this.dashboard.length / 4); // This increases the row number every 4 charts

            this.dashboard.push({
                cols: 2, // You might want to standardize or customize this based on type
                rows: 3, // Same as above
                y: positionY,
                x: positionX,
                name: type.charAt(0).toUpperCase() + type.slice(1) + ' Chart',
                type: 'chart',

                component: component,
            });
        } else {
            console.error('Invalid chart type:', type);
        }
    }

    newCharts: any[] = [];

    updateChartConfigs(newConfig: any): void {
        this.newCharts.push(newConfig);
        this.dashboard.push(newConfig);
        this.saveState();
    }

    addNewChartToDashboard(chartConfig: any) {
        const newChartItem: DashboardItem = {
            cols: 2,
            rows: 2,
            y: 0,
            x: 0,
            type: 'chart',
            name: chartConfig.title,
            chartType: chartConfig.chartType,
            chartData: chartConfig.data,
            // You might want to add more properties here
        };

        this.dashboard.push(newChartItem);
        this.saveState();
        this.sidenav.close(); // Close the side panel after adding the chart
    }

    setFilter(filter: string): void {
        this.filterService.changeFilter(filter);
    }



    async ngOnInit() {
        this.loadState(); // Load the state on initialization
        this.titleService.updateTitle('Dashboard');

        await this.loadInventoryData();
        await this.fetchUsers();
        await this.dashboardData();
    }
}
