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
import { LineChartComponent } from 'app/components/charts/widgets/widgetLine';
import { PieChartComponent } from 'app/components/charts/widgets/widgetPie';
import { ChartConfig, DashboardService } from '../../pages/dashboard/dashboard.service';
import { DataCollectionService } from './data-collection.service';
import { forkJoin } from 'rxjs';

interface InventoryItem {
    SKU: string;
    category: string;
    quantity: number;
    lowStockThreshold: number;
    reorderAmount: number;
    unitCost: number;
    lastRestockDate: string;
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
    };

    chartConfigs: ChartConfig[] = [];
    inventoryData: InventoryItem[] = [];
    stockRequestData: StockRequest[] = [];

    constructor(
        private dashService: DashboardService,
        private dataCollectionService: DataCollectionService,
    ) {}

    ngOnInit() {
        this.fetchAndProcessData();
    }

    fetchAndProcessData() {
        forkJoin({
            inventory: this.dataCollectionService.getInventoryItems(),
            requests: this.dataCollectionService.getStockRequests(),
        }).subscribe({
            next: ({ inventory, requests }) => {
                this.inventoryData = inventory;
                this.stockRequestData = this.filterCurrentMonthRequests(requests);
                this.generateChartConfigs();
            },
            error: (error) => console.error('Error fetching data:', error),
        });
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
            this.prepareAverageUnitCostByCategory(),
            this.prepareUnitCostTrendOverTime(),
            this.prepareUnitCostDistribution(),
        ];

        this.chartConfigs = chartConfigs;
        chartConfigs.forEach((chart) => console.log(`${chart.title} configuration:`, chart));
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

    prepareAverageUnitCostByCategory(): ChartConfig {
        const categoryAverages = this.inventoryData.reduce(
            (acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = { total: 0, count: 0 };
                }
                acc[item.category].total += item.unitCost;
                acc[item.category].count++;
                return acc;
            },
            {} as { [key: string]: { total: number; count: number } },
        );

        const data = Object.entries(categoryAverages).map(([category, { total, count }]) => ({
            category,
            averageCost: total / count,
        }));

        return this.prepareChartConfig(
            'bar',
            { categories: data.map((d) => d.category), values: data.map((d) => d.averageCost) },
            'Average Unit Cost by Category',
            'BarChartComponent',
        );
    }

    prepareUnitCostTrendOverTime(): ChartConfig {
        // Helper function to extract date from timestamp
        const extractDate = (timestamp: string | undefined): string => {
            if (!timestamp) return '';
            const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : '';
        };
    
        // Group items by date and calculate average unit cost
        const dateGroups = this.inventoryData.reduce((acc, item) => {
            if (item.lastRestockDate === undefined || item.unitCost === undefined) {
                console.warn('Invalid item data:', item);
                return acc;
            }
    
            const date = extractDate(item.lastRestockDate);
            if (!date) {
                console.warn('Invalid date format:', item.lastRestockDate);
                return acc;
            }
            
            if (!acc[date]) {
                acc[date] = { total: 0, count: 0 };
            }
            acc[date].total += item.unitCost;
            acc[date].count++;
            return acc;
        }, {} as { [date: string]: { total: number; count: number } });
    
        // Calculate average and create data points
        const dataPoints = Object.entries(dateGroups).map(([date, { total, count }]) => ({
            date,
            averageUnitCost: total / count
        }));
    
        // Sort data points by date
        const sortedDataPoints = dataPoints.sort((a, b) => a.date.localeCompare(b.date));
    
        if (sortedDataPoints.length === 0) {
            console.warn('No valid data points for unit cost trend');
            return this.prepareChartConfig(
                'line',
                { categories: [], values: [] },
                'Average Unit Cost Trend Over Time (No Data)',
                'LineChartComponent'
            );
        }
    
        return this.prepareChartConfig(
            'line',
            {
                categories: sortedDataPoints.map(d => d.date),
                values: sortedDataPoints.map(d => d.averageUnitCost)
            },
            'Average Unit Cost Trend Over Time',
            'LineChartComponent'
        );
    }

    prepareUnitCostDistribution(): ChartConfig {
        const costRanges = [0, 10, 20, 50, 100, 200, Infinity];
        const rangeLabels = costRanges
            .slice(0, -1)
            .map((min, index) => `$${min} - $${costRanges[index + 1] === Infinity ? '200+' : costRanges[index + 1]}`);

        const distribution = this.inventoryData.reduce(
            (acc, item) => {
                const rangeIndex = costRanges.findIndex((max) => item.unitCost < max) - 1;
                acc[rangeIndex] = (acc[rangeIndex] || 0) + 1;
                return acc;
            },
            {} as { [key: number]: number },
        );

        const data = {
            categories: rangeLabels,
            values: rangeLabels.map((_, index) => distribution[index] || 0),
        };

        return this.prepareChartConfig('bar', data, 'Unit Cost Distribution', 'BarChartComponent');
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
