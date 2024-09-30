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
import { BarHorizontalComponent } from 'app/components/charts/bar-horizontal/bar-horizontal.component';
import { ScatterplotComponent } from 'app/components/charts/scatterplot/scatterplot.component';
import { DonutTemplateComponent } from 'app/components/charts/donuttemplate/donuttemplate.component';
import { AddWidgetSidePaneComponent } from '../../components/add-widget-side-pane/add-widget-side-pane.component';
import { CardData, ChartConfig, DashboardItem, DashboardService } from '../dashboard/dashboard.service';
import { ChangeDetectionService } from './change-detection.service';
import { DataCollectionService, StockRequest } from '../../components/add-widget-side-pane/data-collection.service';
import { MetricCardComponent } from '../../components/charts/widgets/metric-card.component';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
interface Order {
    tenentId: string;
    Order_Status: string;
    Expected_Delivery_Date?: string;
    Order_Date: string;
    Selected_Supplier?: string;
}

interface SkuCounts {
    [key: string]: number;
}

interface RequestOrders {
    requests: {
        totalRequests: number;
        mostRequested: {
            name: string;
            percentage: number;
        };
        highestRequest: number;
    };
    backorders: {
        currentBackorders: number;
        averageDelay: number;
        longestBackorderItem: {
            productName: string;
            delay: string;
        };
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
        BarHorizontalComponent,
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
    isLoading = false;
    Math: any;

    cardData: CardData[] = [];
    chartConfigs: any[] = [];
    dashboard: Array<DashboardItem> = [];
    options!: GridsterConfig;
    rowData: any[] = [];
    stockRequest: any[] = [];
    orders: any[] = [];

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

    RequestOrders: RequestOrders = {
        requests: {
            totalRequests: 0,
            mostRequested: {
                name: '',
                percentage: 0,
            },
            highestRequest: 0,
        },
        backorders: {
            currentBackorders: 0,
            averageDelay: 0,
            longestBackorderItem: {
                productName: '',
                delay: '',
            },
        },
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
        this.isLoading = true;
        this.setupDashboardSubscription();

        await this.loadState();
        if (!this.dataCollectionService.isCacheValidOverall()) {
            this.refreshDashboard();
        }

        // Use Promise.all to wait for both operations to complete
        const [stockRequests, orders] = await Promise.all([
            this.dataCollectionService.getAllStockRequests().toPromise(),
            this.dataCollectionService.fetchAllOrders(),
        ]);

        this.stockRequest = stockRequests || [];
        this.orders = orders || [];

        await this.populateRequestOrders(this.stockRequest, this.orders);
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

    async populateRequestOrders(stockRequests: any[], orders: any[]): Promise<void> {
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
            console.error('TenantId not found');
            return;
        }

        // Filter stock requests by tenantId
        const filteredStockRequests = stockRequests.filter((request) => request.tenentId === tenantId);

        // Calculate requests data
        const skuCounts: SkuCounts = filteredStockRequests.reduce((counts, request) => {
            counts[request.sku] = (counts[request.sku] || 0) + request.quantityRequested;
            return counts;
        }, {} as SkuCounts);

        const totalRequests: number = Object.values(skuCounts).reduce((sum, count) => sum + count, 0);
        const highestRequest: number = Math.max(...Object.values(skuCounts));
        const mostRequestedEntry = Object.entries(skuCounts).reduce((a, b) => (a[1] > b[1] ? a : b));
        const mostRequestedSku = mostRequestedEntry[0];
        const mostRequestedPercentage = (skuCounts[mostRequestedSku] / totalRequests) * 100;

        // Calculate backorders data
        const backorders = orders.filter(
            (order) =>
                order.tenentId === tenantId &&
                order.Order_Status === 'Pending Approval' &&
                order.Expected_Delivery_Date,
        );
        const currentBackorders = backorders.length;

        const delays = backorders.map((order) => this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!));
        const totalDelay = delays.reduce((sum, delay) => sum + delay, 0);
        const averageDelay = currentBackorders > 0 ? totalDelay / currentBackorders : 0;

        const longestDelay = Math.max(...delays);
        const longestBackorderItem = backorders.find(
            (order) => this.calculateDelay(order.Order_Date, order.Expected_Delivery_Date!) === longestDelay,
        );

        // Populate RequestOrders
        this.RequestOrders = {
            requests: {
                totalRequests,
                mostRequested: {
                    name: mostRequestedSku || 'None found',
                    percentage: Number(mostRequestedPercentage.toFixed(2)) || 0,
                },
                highestRequest,
            },
            backorders: {
                currentBackorders,
                averageDelay: Math.round(averageDelay),
                longestBackorderItem: {
                    productName: longestBackorderItem?.Selected_Supplier || 'None found',
                    delay: longestDelay > 0 ? this.formatDelay(longestDelay) : '',
                },
            },
        };

        console.log('Populated RequestOrders:', this.RequestOrders);
    }

    private calculateDelay(orderDate: string, expectedDate: string): number {
        const order = new Date(orderDate);
        const expected = new Date(expectedDate);
        return Math.max(0, Math.round((expected.getTime() - order.getTime()) / (1000 * 60 * 60 * 24)));
    }

    private formatDelay(delay: number): string {
        return `${delay} days`;
    }

    private async loadState() {
        const savedState = this.dashService.getState();
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (Array.isArray(parsedState)) {
                this.dashboard = parsedState;
            } else {
                console.error('Saved state is not an array, initializing default dashboard');
                this.dashboard = this.dashService.initializeDashboard();
            }
        } else {
            this.dashboard = this.dashService.initializeDashboard();
            this.isLoading = false;
        }
        this.CDRService.detectChanges();
    }

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
        this.dashboard = [];
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
        const currentDashboard = this.dashService.getDashboard();
        const updatedDashboard = currentDashboard.map((item) => {
            const updatedConfig = newChartConfigs.find((config) => config.title === item.name);
            if (updatedConfig) {
                return {
                    ...item,
                    chartConfig: updatedConfig,
                };
            }
            return item;
        });

        this.dashService.updateDashboard(updatedDashboard);
        this.dashboard = updatedDashboard;
        this.CDRService.detectChanges();
    }
}
