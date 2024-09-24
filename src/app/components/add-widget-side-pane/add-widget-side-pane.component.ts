import { Component, Input, Output, EventEmitter, Type, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { templateQuoteModalComponent } from '../template-quote-modal/template-quote-modal.component';
import { BubblechartComponent } from '../../components/charts/bubblechart/bubblechart.component';
import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { BarChartComponent } from 'app/components/charts/widgets/widgetBar';
import { ScatterplotComponent } from '../charts/scatterplot/scatterplot.component';
import { DonutTemplateComponent } from '../charts/donuttemplate/donuttemplate.component';
import { LineChartComponent } from 'app/components/charts/widgets/widgetLine';
import { PieChartComponent } from 'app/components/charts/widgets/widgetPie';
import { RadarComponent } from '../charts/radar/radar.component';
import { LineBarComponent } from '../charts/line-bar/line-bar.component';
import { ChartConfig, DashboardService } from '../../pages/dashboard/dashboard.service';
import { DataCollectionService } from './data-collection.service';
import { forkJoin, from } from 'rxjs';

interface InventoryItem {
    SKU: string;
    category: string;
    quantity: number;
    lowStockThreshold: number;
    reorderAmount: number;
}

interface StockRequest {
    category: string;
    quantityRequested: number;
    createdAt: string;
}

@Component({
    selector: 'app-templates-side-pane',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        templateQuoteModalComponent,
        BarchartComponent,
        DonutchartComponent,
        SaleschartComponent,
        BubblechartComponent,
        LineChartComponent,
        PieChartComponent,
        BarChartComponent,
        LineBarComponent,
        RadarComponent,
        ScatterplotComponent,
        DonutTemplateComponent,
    ],
    templateUrl: './add-widget-side-pane.component.html',
    styleUrls: ['./add-widget-side-pane.component.css'],
})
export class AddWidgetSidePaneComponent implements OnInit {
    @Input() isAddWidgetOpen = false;
    @Output() closed = new EventEmitter<void>();

    charts: { [key: string]: Type<any> } = {
        SaleschartComponent,
        BarchartComponent,
        BubblechartComponent,
        DonutchartComponent,
        BarChartComponent,
        LineChartComponent,
        PieChartComponent,
        LineBarComponent,
        RadarComponent,
        ScatterplotComponent,
        DonutTemplateComponent,
    };

    chartConfigs: ChartConfig[] = [];
    inventoryData: InventoryItem[] = [];
    stockRequestData: StockRequest[] = [];
    originalData: any[] = [];
    orderData: any[] = [];
    scatterPlotChartData: any[] = [];

    constructor(
        private dashService: DashboardService,
        private dataCollectionService: DataCollectionService,
    ) { }

    ngOnInit() {
        this.fetchAndProcessData();
    }

    fetchAndProcessData() {
        forkJoin({
            inventory: this.dataCollectionService.getInventoryItems(),
            requests: this.dataCollectionService.getStockRequests(),
            suppliers: this.dataCollectionService.getSupplierReportData(),
            scatterPlot: from(this.fetchScatterPlotData()),
            orders: from(this.fetchOrderData())
        }).subscribe({
            next: ({ inventory, requests, suppliers }) => {
                this.inventoryData = inventory;
                this.stockRequestData = this.filterCurrentMonthRequests(requests);
                this.originalData = suppliers;
                console.log('my original data:' , this.originalData)
                this.generateChartConfigs();
            },
            error: (error) => console.error('Error fetching data:', error),
        });
    }

    async fetchOrderData() {
        try {
            this.orderData = await this.dataCollectionService.fetchOrdersReport() || [];
            console.log('Processed orders:', this.orderData);
        } catch (error) {
            console.error('Error in fetchOrderData:', error);
            this.orderData = [];
        }
    }

    async fetchScatterPlotData() {
        try {
            const supplierQuotes = await this.dataCollectionService.getSupplierQuotePrices().toPromise() || [];
            this.scatterPlotChartData = this.prepareScatterPlotData(supplierQuotes);
        } catch (error) {
            console.error('Error fetching supplier quote prices:', error);
            this.scatterPlotChartData = [];
        }
    }
    
    private prepareScatterPlotData(supplierQuotes: any[]): any[] {
        return supplierQuotes.map((item) => ({
            unitPrice: item.UnitPrice,
            discount: item.Discount,
            availableQuantity: item.AvailableQuantity,
            itemSKU: item.ItemSKU,
        }));
    }

    filterCurrentMonthRequests(requests: StockRequest[]): StockRequest[] {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return requests.filter((request) => {
            const requestDate = new Date(request.createdAt);
            return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
        });
    }

    generateChartConfigs() {
        const chartConfigs = [
            this.prepareStockRequestChartConfig(),
            this.prepareStockRequestLineChartConfig(),
            this.prepareInventoryStockLevelChartConfig('pie'),
            this.prepareInventoryStockLevelChartConfig('bar'),
            this.prepareIntakeOutakeCorrelationChartConfig(),
            this.prepareLineBarChartConfig(),
            this.prepareRadarChartConfig(),
            this.prepareScatterPlotChartConfig(),
            this.prepareDonutChartConfig(),
        ];

        this.chartConfigs = chartConfigs;
        chartConfigs.forEach((chart) => console.log(`${chart.title} configuration:`, chart));
    }

    prepareScatterPlotChartConfig(): ChartConfig {
        return this.prepareChartConfig(
            'scatter',
            this.scatterPlotChartData,
            'Supplier Quote Prices',
            'ScatterPlotComponent'
        );
    }
    
    prepareDonutChartConfig(): ChartConfig {
        // Assuming you want to show order status distribution
        // const statusCounts = this.orderData.reduce((acc, order) => {
        //     acc[order.status] = (acc[order.status] || 0) + 1;
        //     return acc;
        // }, {});
    
        // const donutData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    
        return this.prepareChartConfig(
            'donut',
            this.orderData,
            'Order Status Distribution',
            'DonutChartComponent'
        );
    }


    prepareLineBarChartConfig(): ChartConfig {
        const groupedData = this.groupDataByTopSupplier();
        const formattedData = this.formatDataForChart(groupedData);
        return this.prepareChartConfig(
            'linebar',
            { source: formattedData.source },
            'Top Suppliers Spending Over Time',
            'LineBarComponent'
        );
    }

    prepareRadarChartConfig(): ChartConfig {
        const topSuppliers = this.calculateTopSuppliers();
        return this.prepareChartConfig(
            'radar',
            topSuppliers,
            'Top Suppliers Performance Overview',
            'RadarComponent'
        );
    }

    private groupDataByTopSupplier(): any {
        // Implementation as provided in your code
        const grouped = this.originalData.reduce((acc, data) => {
            const id = data['Supplier ID'];
            if (!acc[id]) {
                acc[id] = { ...data, count: 1 }; // Initial creation of the group
            } else {
                acc[id].TotalSpent += data.TotalSpent; // Summing up TotalSpent
                acc[id].count += 1; // Counting occurrences
            }
            return acc;
        }, {});

        return Object.values(grouped)
            .sort((a: any, b: any) => b.TotalSpent - a.TotalSpent)
            .slice(0, 5);
    }

    private formatDataForChart(data: any[]): any {
        // Implementation as provided in your code
        const years = [
            ...new Set(
                data.flatMap((supplier: any) =>
                    this.originalData
                        .filter((item) => item['Supplier ID'] === supplier['Supplier ID'])
                        .map((item) => item.Date.slice(0, 4)),
                ),
            ),
        ].sort();
        const header = ['Supplier ID', ...years];

        // Map each supplier to a row in the chart data
        const chartData = data.map((supplier: any) => {
            const row = [supplier['Supplier ID'], ...Array(years.length).fill(0)];
            this.originalData
                .filter((item) => item['Supplier ID'] === supplier['Supplier ID'])
                .forEach((item) => {
                    const yearIndex = years.indexOf(item.Date.slice(0, 4)) + 1; // Find correct index for the year
                    row[yearIndex] += item.TotalSpent; // Accumulate total spent for the year
                });
            return row;
        });

        return {
            source: [header, ...chartData],
        };
    }

    private calculateTopSuppliers(): any[] {
        // Implementation as provided in your code

        const supplierAggregates = this.originalData.reduce((acc, data) => {
            const id = data['Supplier ID'];
            if (!acc[id]) {
                acc[id] = {
                    supplierId: id,
                    totalSpent: 0,
                    averageOnTimeDelivery: 0,
                    averageOrderAccuracy: 0,
                    averageOutstandingPayments: 0,
                    count: 0,
                };
            }
            acc[id].totalSpent += data.TotalSpent;
            acc[id].averageOnTimeDelivery += data['On Time Delivery Rate'];
            acc[id].averageOrderAccuracy += data['Order Accuracy Rate'];
            acc[id].averageOutstandingPayments += data['Out Standing Payments'];
            acc[id].count += 1;
            return acc;
        }, {});

        // Step 2: Calculate averages and score
        const scoredSuppliers = Object.values(supplierAggregates).map((supplier: any) => {
            supplier.averageOnTimeDelivery /= supplier.count;
            supplier.averageOrderAccuracy /= supplier.count;
            supplier.averageOutstandingPayments /= supplier.count;
            supplier.score =
                supplier.averageOnTimeDelivery +
                supplier.averageOrderAccuracy -
                supplier.averageOutstandingPayments / 1000 +
                supplier.totalSpent / 100000;
            return supplier;
        });

        // Step 3: Sort by score and select the top 5
        return scoredSuppliers
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((supplier) => ({
                'Supplier ID': supplier.supplierId,
                'Total Spent': supplier.totalSpent,
                'On Time Delivery Rate': supplier.averageOnTimeDelivery,
                'Order Accuracy Rate': supplier.averageOrderAccuracy,
                'Out Standing Payments': supplier.averageOutstandingPayments,
            }));
    }

    prepareStockRequestChartConfig(): ChartConfig {
        const categorySums = this.sumBy(this.stockRequestData, 'category');
        return this.prepareChartConfig(
            'pie',
            this.mapToChartData(categorySums),
            'Stock Requests by Category',
            'PieChartComponent',
        );
    }

    prepareStockRequestLineChartConfig(): ChartConfig {
        const dailySums = this.sumBy(this.stockRequestData, 'createdAt');
        const sortedDates = Object.keys(dailySums).sort();
        return this.prepareChartConfig(
            'line',
            {
                categories: sortedDates,
                values: sortedDates.map((date) => dailySums[date]),
            },
            'Daily Stock Requests',
            'LineChartComponent',
        );
    }

    prepareInventoryStockLevelChartConfig(chartType: 'pie' | 'bar'): ChartConfig {
        const categoryCounts = this.categorizeInventoryItems();
        const categories = ['Low Stock', 'Needs Reorder', 'Healthy Stock'];
        const data =
            chartType === 'pie'
                ? this.mapToChartData(categoryCounts)
                : { categories, values: categories.map((category) => categoryCounts[category] || 0) };
        return this.prepareChartConfig(
            chartType,
            data,
            'Inventory Stock Level Distribution',
            `${chartType.charAt(0).toUpperCase() + chartType.slice(1)}ChartComponent`,
        );
    }

    prepareIntakeOutakeCorrelationChartConfig(): ChartConfig {
        const categoryMap = new Map<string, { inventoryQuantity: number; requestedQuantity: number }>();

        this.inventoryData.forEach((item) => {
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, { inventoryQuantity: 0, requestedQuantity: 0 });
            }
            categoryMap.get(item.category)!.inventoryQuantity += item.quantity;
        });

        this.stockRequestData.forEach((request) => {
            if (!categoryMap.has(request.category)) {
                categoryMap.set(request.category, { inventoryQuantity: 0, requestedQuantity: 0 });
            }
            categoryMap.get(request.category)!.requestedQuantity += request.quantityRequested;
        });

        const categories = Array.from(categoryMap.keys());
        const inventoryData = categories.map((cat) => categoryMap.get(cat)!.inventoryQuantity);
        const requestData = categories.map((cat) => categoryMap.get(cat)!.requestedQuantity);

        const chartData = {
            categories: categories,
            series: [
                { name: 'Current Inventory', data: inventoryData },
                { name: 'Requested Quantity', data: requestData },
            ],
        };

        return this.prepareChartConfig(
            'bar',
            chartData,
            'Inventory vs Stock Requests by Category (Current Month)',
            'BarChartComponent',
        );
    }

    private sumBy(arr: any[], key: string): { [key: string]: number } {
        return arr.reduce(
            (acc, item) => ({
                ...acc,
                [item[key]]: (acc[item[key]] || 0) + item.quantityRequested,
            }),
            {},
        );
    }

    private mapToChartData(obj: { [key: string]: number }): { name: string; value: number }[] {
        return Object.entries(obj).map(([name, value]) => ({ name, value }));
    }

    private categorizeInventoryItems(): { [category: string]: number } {
        return this.inventoryData.reduce((acc: { [key: string]: number }, item) => {
            const category =
                item.quantity <= item.lowStockThreshold
                    ? 'Low Stock'
                    : item.quantity <= item.lowStockThreshold + item.reorderAmount
                        ? 'Needs Reorder'
                        : 'Healthy Stock';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
    }

    private prepareChartConfig(type: string, data: any, title: string, component: string): ChartConfig {
        return { type, data, title, component };
    }

    addWidget(chartConfig: ChartConfig) {
        this.dashService.addWidget(chartConfig);
        this.close();
    }

    close() {
        this.closed.emit();
    }
}
