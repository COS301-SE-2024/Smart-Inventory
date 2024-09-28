import { TitleService } from '../../header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
// import { MatCardModule } from '@angular/material/card';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { SaleschartComponent } from '../../charts/saleschart/saleschart.component';
import { ActivatedRoute, Router } from '@angular/router';
import outputs from '../../../../../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { LoadingSpinnerComponent } from '../../loader/loading-spinner.component';
import { DateSelectCellEditorComponent } from './date-select-cell-editor.component';
import { RoleSelectCellEditorComponent } from '../../../pages/team/role-select-cell-editor.component';
import { LineBarComponent } from '../../charts/line-bar/line-bar.component';
import { LineComponent } from '../../charts/line/line.component';
import { RadarComponent } from '../../charts/radar/radar.component';
import { DataCollectionService } from 'app/components/add-widget-side-pane/data-collection.service';

type ChartData = {
    source: any[];
};

interface SupplierData {
    'Supplier ID': string;
    Date: string;
    'On Time Delivery Rate': number;
    'Order Accuracy Rate': number;
    'Out Standing Payments': number;
    'Reorder Level': string;
    RiskScore: string;
    TotalSpent: string;
}

@Component({
    selector: 'app-supplier-report',
    standalone: true,
    imports: [
        GridComponent,
        // MatCardModule,
        MatGridListModule,
        MaterialModule,
        CommonModule,
        MatProgressSpinnerModule,
        SaleschartComponent,
        LoadingSpinnerComponent,
        LineBarComponent,
        DateSelectCellEditorComponent,
        RoleSelectCellEditorComponent,
        LineComponent,
        RadarComponent,
    ],
    templateUrl: './supplier-report.component.html',
    styleUrl: './supplier-report.component.css',
})
export class SupplierReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
        private dataCollectionService: DataCollectionService,
    ) {
        Amplify.configure(outputs);
    }

    currentIndex = 0;
    chartData: any;
    initialInventory: number = 500; // Starting inventory at the beginning of the period
    endingInventory: number = 600; // Ending inventory at the end of the period

    automation: boolean = true;
    @ViewChild('gridComponent') gridComponent!: GridComponent;
    // rowData: any[] = [];
    supplierIds: any[] = [];
    isLoading = true;

    selectedItem: any = null;
    requestQuantity: number | null = null;
    inventory: any[] = [];

    SupplierReport = {
        title: 'Supplier Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: [
            { name: 'Average supplier performance', value: null, icon: 'bar_chart' },
            { name: 'Overall product defect rate', value: '0%', icon: 'error_outline' },
            { name: 'Worst performer', value: null, icon: 'trending_down' },
            { name: 'Average delivery rate', value: null, icon: 'local_shipping' },
            { name: 'Fill Rate', value: '0%', icon: 'inventory_2' },
            { name: 'Total inventory turnover', value: 'null', icon: 'loop' },
            { name: '"Right First Time" Rate', value: '0%', icon: 'check_circle_outline' },
            { name: 'On-time Order Completion Rate', value: 0, icon: 'schedule' },
        ],
        graphs: [],
    };

    tiles: any[] = [];

    // currentIndex = 0;

    showNextTiles() {
        this.currentIndex += 3;
        if (this.currentIndex >= this.tiles.length) {
            this.currentIndex = 0; // Wrap around to the start
        }
    }

    async ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
        await this.loadInventoryData();
        await this.loadOrderData();
        await this.loadSuppliersData();
        await this.loadStockRequest();

        console.log('Inventory data:', this.inventory);
        console.log('Order data:', this.orders);
        console.log('Supplier data:', this.originalData);
        console.log('Stock request data:', this.stockRequests);

        if (this.originalData.length > 0) {
            this.updateOrderFulfillmentDetails();
            console.log('Order fulfillment details:', this.orderFulfillmentDetails);
            this.chartData = this.getChartData();
            this.processData();
            this.topSuppliersData = this.calculateTopSuppliers();
            this.updateReportMetrics();
            console.log('Updated report metrics:', this.SupplierReport.metrics);
            console.log('Top suppliers data:', this.topSuppliersData);
            console.log('Chart data:', this.chartData);
        } else {
            console.warn('No supplier data available for processing');
        }
        this.isLoading = false;
    }

    colDefs!: ColDef[];
    originalData: SupplierData[] = [];

    getCurrentRoute() {
        this.colDefs = [
            {
                field: 'Supplier ID',
                headerName: 'Supplier ID',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Unique identifier for each supplier',
            },
            {
                field: 'Date',
                headerName: 'Date',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Date of the recorded metrics',
            },
            {
                field: 'On Time Delivery Rate',
                headerName: 'On Time Delivery Rate',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Percentage of orders delivered on time by the supplier',
            },
            {
                field: 'Order Accuracy Rate',
                headerName: 'Order Accuracy Rate',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Percentage of orders fulfilled accurately by the supplier',
            },
            {
                field: 'Out Standing Payments',
                headerName: 'Out Standing Payments',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Amount of payments currently due to the supplier',
            },
            {
                field: 'Reorder Level',
                headerName: 'Reorder Level',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Stock level at which a new order should be placed with this supplier',
            },
            {
                field: 'RiskScore',
                headerName: 'Risk Score',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Calculated risk assessment score for the supplier',
            },
            {
                field: 'TotalSpent',
                headerName: 'Total Spent',
                filter: 'agSetColumnFilter',
                headerTooltip: 'Cumulative amount spent with this supplier',
            },
        ];
        return 'Supplier Report';
    }

    getUniqueSuppliers(data: any[]): any[] {
        const uniqueSuppliers: any[] = [];
        data.forEach((item) => {
            if (!uniqueSuppliers[item['Supplier ID']]) {
                uniqueSuppliers[item['Supplier ID']] = item;
            }
        });
        return Object.values(uniqueSuppliers);
    }

    getAvailableDates(supplierId: string): string[] {
        return this.originalData.filter((item) => item['Supplier ID'] === supplierId).map((item) => item['Date']);
    }

    // Function to fetch data based on date and supplier ID
    fetchDataForDate(supplierId: string, date: string): any {
        // Mock function to simulate fetching data for a specific date
        return this.rowData.find((row) => row['Supplier ID'] === supplierId && row.Date === date);
    }
    orders: any[] = [];
    updateOrderFulfillmentDetails() {
        this.orderFulfillmentDetails = this.orders.map(order => {
            const supplier = this.originalData.find(s => s['Supplier ID'] === order.supplier);
            const inventoryItem = this.inventory.find(item => item.supplier === order.supplier);

            let supplierPerformanceScore = 100; // Start with a perfect score
            let deliveryStatus = 'On Time';

            if (order.status === 'Completed' && order.expectedOrderDate && order.orderReceivedDate) {
                const expectedDate = new Date(order.expectedOrderDate);
                const actualDate = new Date(order.orderReceivedDate);
                const daysDifference = (actualDate.getTime() - expectedDate.getTime()) / (1000 * 3600 * 24);

                if (daysDifference > 0) {
                    supplierPerformanceScore -= Math.min(daysDifference * 5, 30); // Deduct up to 30 points for late delivery
                    deliveryStatus = 'Late';
                } else if (daysDifference < 0) {
                    supplierPerformanceScore += Math.min(Math.abs(daysDifference) * 2, 10); // Bonus up to 10 points for early delivery
                    deliveryStatus = 'Early';
                }

                // Adjust score based on order accuracy
                const expectedQuantity = inventoryItem ? inventoryItem.reorderAmount : 0;
                const actualQuantity = order.status === 'Completed' ? expectedQuantity : 0; // Assuming completed orders are fully delivered
                if (expectedQuantity > 0) {
                    const accuracyPercentage = (actualQuantity / expectedQuantity) * 100;
                    supplierPerformanceScore += (accuracyPercentage - 100) * 0.5; // Adjust score based on accuracy
                }
            } else {
                deliveryStatus = 'Pending';
            }

            // Ensure the score is between 0 and 100
            supplierPerformanceScore = Math.max(0, Math.min(100, supplierPerformanceScore));

            // Generate a safe QuoteID
            let quoteID = 'Unknown';
            if (order.orderID) {
                const parts = order.orderID.split('-');
                quoteID = parts.length > 2 ? `QT-${parts[2]}` : `QT-${order.orderID}`;
            }

            return {
                OrderID: order.orderID || 'Unknown',
                SupplierID: supplier ? supplier['Supplier ID'] : 'Unknown',
                QuoteID: quoteID,
                UPC: inventoryItem ? inventoryItem.upc : 'Unknown',
                OrderedQuantity: inventoryItem ? inventoryItem.reorderAmount : 0,
                DeliveredQuantity: order.status === 'Completed' ? (inventoryItem ? inventoryItem.reorderAmount : 0) : 0,
                SupplierPerformanceScore: supplierPerformanceScore.toFixed(2),
                DeliveryStatus: deliveryStatus,
                OrderDate: order.orderIssuedDate ? new Date(order.orderIssuedDate) : null,
                DeliveryDate: order.status === 'Completed' && order.orderReceivedDate ? new Date(order.orderReceivedDate) : null,
                Category: inventoryItem ? inventoryItem.category : 'Unknown'
            };
        });
    }

    calculateAverageSupplierPerformanceScore(): { [key: string]: number } {
        const supplierScores: { [key: string]: number[] } = {};

        this.orderFulfillmentDetails.forEach(detail => {
            if (!supplierScores[detail.SupplierID]) {
                supplierScores[detail.SupplierID] = [];
            }
            supplierScores[detail.SupplierID].push(parseFloat(detail.SupplierPerformanceScore));
        });

        const averageScores: { [key: string]: number } = {};
        for (const [supplierId, scores] of Object.entries(supplierScores)) {
            if (scores.length > 0) {
                averageScores[supplierId] = scores.reduce((a, b) => a + b, 0) / scores.length;
            }
        }

        return averageScores;
    }


    orderFulfillmentDetails: any[] = [];

    calculateInventoryTurnover(stockRequests: any[], initialInventory: number, endingInventory: number): string {
        let totalAddedInventory = stockRequests.reduce((sum, request) => sum + request.quantityFulfilled, 0);
        let averageInventory = (initialInventory + endingInventory) / 2;

        return (totalAddedInventory / averageInventory).toFixed(2);
    }

    calculateOrderFulfillmentRate(details: any[]): string {
        let totalOrdered = 0;
        let totalDelivered = 0;

        details.forEach((detail) => {
            totalOrdered += detail.OrderedQuantity;
            totalDelivered += detail.DeliveredQuantity;
        });

        if(Number.isNaN(((totalDelivered / totalOrdered) * 100))){
            return '0.0';
        }

        return ((totalDelivered / totalOrdered) * 100).toFixed(2); // Returns the fulfillment rate as a percentage
    }

    calculateDefectRate(details: any[]): string {
        if (details.length === 0) return '0';
        let totalItemsReceived = 0;
        let defectiveItems = 0;

        details.forEach((detail) => {
            totalItemsReceived += detail.DeliveredQuantity;
            if (detail.DeliveryStatus !== 'On Time') {
                defectiveItems += detail.DeliveredQuantity;
            }
        });

        if(Number.isNaN(((defectiveItems / totalItemsReceived) * 100))){
            return '0.0';
        }

        return ((defectiveItems / totalItemsReceived) * 100).toFixed(2);
    }

    calculateRightFirstTimeRate(details: any[]): number {
        if (details.length === 0) return 0;
        let totalOrders = details.length;
        let rightFirstTimeCount = details.filter(
            (detail) => detail.DeliveredQuantity === detail.OrderedQuantity && detail.DeliveryStatus === 'On Time'
        ).length;

        return (rightFirstTimeCount / totalOrders) * 100;
    }


    getChartData(): {
        xAxisData: string[];
        title: string;
        yAxisName: string; // Ensure you have a yAxisName to pass along
        seriesData: {
            name: string;
            data: number[];
        }[];
    } {
        const title = 'On Time Delivery Rate';
        const yAxisName = title; // Assuming you use the title as the yAxisName, adjust if necessary

        // Extract years dynamically from the data and sort them
        const years = [...new Set(this.originalData.map((item) => item['Date'].slice(0, 4)))].sort();
        const supplierIds = [...new Set(this.originalData.map((item) => item['Supplier ID']))];

        // Aggregate data for all metrics into one series per supplier
        const seriesData = supplierIds.map((supplierId) => {
            const data = years.map((year) => {
                const yearData = this.originalData.filter(
                    (d) => d['Supplier ID'] === supplierId && d['Date'].startsWith(year),
                );
                // Sum or average data based on metric, here we assume it's sum
                return yearData.reduce((acc, item) => acc + Number(item[title] || 0), 0);
            });
            return { name: supplierId, data };
        });

        console.log('Series Data:', seriesData);

        return {
            xAxisData: years,
            seriesData,
            title,
            yAxisName,
        };
    }

    async fetchMetrics(data: any[]) {
        try {
            console.log('processed data fetchmetrics:', data);

            let totalSpent = 0;
            let outstandingPayments = 0;

            data.forEach((supplier) => {
                // Parse the string values to floats and add them
                totalSpent += parseFloat(supplier['TotalSpent']) || 0;
                outstandingPayments += parseFloat(supplier['Out Standing Payments']) || 0;
            });

            console.log('Total spent:', totalSpent.toFixed(2), 'Outstanding payments:', outstandingPayments.toFixed(2));

            this.tiles.push(
                this.createTile('attach_money', 'Total Spend', 'Total Spent', totalSpent.toFixed(2)),
                this.createTile(
                    'money_off',
                    'Outstanding Payments',
                    'Outstanding Payments',
                    outstandingPayments.toFixed(2),
                ),
            );

            data.forEach((supplier) => {
                this.tiles.push(
                    this.createTile(
                        'schedule',
                        'On-Time Delivery',
                        'On Time Delivery Rate',
                        supplier['On Time Delivery Rate'].toString(),
                    ),
                    this.createTile(
                        'check_circle',
                        'Order Accuracy',
                        'Order Accuracy Rate',
                        supplier['Order Accuracy Rate'].toString(),
                    ),
                    this.createTile('repeat', 'Reorder Level', 'Reorder Level', supplier['Reorder Level']),
                    this.createTile('warning', 'Risk Score', 'Risk Score', supplier['RiskScore']),
                );
            });
        } catch (error) {
            console.log('Error fetching metrics:', error);
        }
    }

    private createTile(icon: string, iconLabel: string, metricName: string, value: string): any {
        return {
            icon: icon,
            iconLabel: iconLabel,
            metricName: metricName,
            value: value,
            additionalInfo: this.determineAdditionalInfo(metricName, value),
        };
    }

    private determineAdditionalInfo(metricName: string, value: string): string {
        switch (metricName) {
            case 'On Time Delivery Rate':
                return parseFloat(value) > 90 ? 'High reliability' : 'Needs improvement';
            case 'Order Accuracy Rate':
                if (parseFloat(value) > 95) {
                    return 'Very accurate';
                } else if (parseFloat(value) > 90) {
                    return 'Generally reliable';
                } else {
                    return 'Prone to errors';
                }
            case 'Reorder Level':
                return value === 'Low' ? 'Low stock warning' : 'Stock level adequate';
            case 'Total Spent':
                return parseFloat(value) > 100000 ? 'High spending' : 'Moderate spending';
            case 'Outstanding Payments':
                return parseFloat(value) > 3000 ? 'Due next month' : 'Minor payments';
            case 'Risk Score':
                switch (value) {
                    case 'High':
                        return 'Unstable - High risk of issues';
                    case 'Moderate':
                        return 'Caution advised - Moderate risk';
                    case 'Low':
                        return 'Stable - Low risk';
                    default:
                        return 'Unknown risk level';
                }
            default:
                return 'No info available';
        }
    }

    calculateAverages(suppliers: any[]): any {
        // console.log("Received suppliers:", suppliers);

        const total = suppliers.reduce(
            (acc, curr) => {
                // console.log("Current item:", curr); // Check what each supplier item looks like

                // Access properties correctly using bracket notation if they include spaces
                const onTimeRate =
                    typeof curr['On Time Delivery Rate'] === 'number' ? curr['On Time Delivery Rate'] : 0;
                const accuracyRate = typeof curr['Order Accuracy Rate'] === 'number' ? curr['Order Accuracy Rate'] : 0;

                // if (onTimeRate === 0 || accuracyRate === 0) {
                //     console.error('Invalid data for supplier:', curr);
                // }

                return {
                    onTimeDeliveryRate: acc.onTimeDeliveryRate + onTimeRate,
                    orderAccuracyRate: acc.orderAccuracyRate + accuracyRate,
                };
            },
            { onTimeDeliveryRate: 0, orderAccuracyRate: 0 },
        );

        if (suppliers.length === 0) {
            console.error('No suppliers provided to calculate averages.');
            return { onTimeDeliveryRate: 0, orderAccuracyRate: 0 }; // Return zero or handle appropriately
        }

        const averages = {
            onTimeDeliveryRate: total.onTimeDeliveryRate / suppliers.length,
            orderAccuracyRate: total.orderAccuracyRate / suppliers.length,
        };

        // console.log("Calculated averages:", averages);
        return averages;
    }

    // Determine average suppliers based on a threshold percentage
    getMostAverageSupplier(): string {
        const suppliers = this.originalData;
        if (suppliers.length === 0) return 'No Data (0.00%)';

        const averages = this.calculateAverages(suppliers);
        let mostAverageSupplier = null;
        let smallestDifference = Infinity;
        let totalDifference = 0;

        suppliers.forEach((supplier) => {
            const onTimeRate = supplier['On Time Delivery Rate'] || 0;
            const accuracyRate = supplier['Order Accuracy Rate'] || 0;

            const onTimeDiff = Math.abs(onTimeRate - averages.onTimeDeliveryRate);
            const accuracyDiff = Math.abs(accuracyRate - averages.orderAccuracyRate);
            const difference = onTimeDiff + accuracyDiff;

            totalDifference += difference;

            if (difference < smallestDifference) {
                smallestDifference = difference;
                mostAverageSupplier = supplier;
            }
        });

        if (!mostAverageSupplier) return 'No Data (0.00%)';

        const averageDifference = totalDifference / suppliers.length;
        const percentageFromAverage = ((averageDifference - smallestDifference) / averageDifference) * 100;

        return `${mostAverageSupplier['Supplier ID']} (${percentageFromAverage.toFixed(2)}%)`;
    }

    getWorstPerformingSupplier(): any {
        const suppliers = this.originalData;
        console.log('The suppliers:', suppliers);

        let worstSupplier = null;
        let highestScore = -Infinity; // Start with a very low score that any real score will be higher than

        suppliers.forEach((supplier) => {
            // Calculating performance score
            // We could also include risk assessment based on 'RiskScore' and 'Out Standing Payments'
            let performanceScore =
                100 -
                supplier['On Time Delivery Rate'] +
                (100 - supplier['Order Accuracy Rate']) +
                supplier['Out Standing Payments'] / 1000; // Example of scaling outstanding payments

            // Consider RiskScore effect
            let riskFactor = 0;
            switch (supplier['RiskScore'].toLowerCase()) {
                case 'low':
                    riskFactor = 1; // lower risk adds less to the score
                    break;
                case 'moderate':
                    riskFactor = 2;
                    break;
                case 'high':
                    riskFactor = 3; // higher risk adds more to the score
                    break;
            }
            performanceScore += riskFactor * 5; // Weight the risk score

            // Check if this supplier has the highest performance score so far (i.e., worst performance)
            if (performanceScore > highestScore) {
                highestScore = performanceScore;
                worstSupplier = supplier;
            }
        });

        // console.log("Worst Performing Supplier:", worstSupplier);
        return worstSupplier;
    }

    calculateAverageDeliveryRate(): string {
        // Initialize the sum and count variables
        let totalDeliveryRate = 0;
        let count = 0;
        const suppliers = this.originalData;
        // Iterate over each supplier entry
        suppliers.forEach((supplier) => {
            // Check if the "On Time Delivery Rate" is present and is a number
            if (supplier && typeof supplier['On Time Delivery Rate'] === 'number') {
                totalDeliveryRate += supplier['On Time Delivery Rate'];
                count++;
            }
        });

        // Calculate the average delivery rate
        // Ensure we do not divide by zero
        const averageDeliveryRate = count > 0 ? totalDeliveryRate / count : 0;
        return averageDeliveryRate.toFixed(2);
    }

    calculateOnTimeOrderCompletionRate(): string {
        const suppliers = this.originalData;
        const totalRate = suppliers.reduce((sum, supplier) => sum + supplier['On Time Delivery Rate'], 0);
        return (totalRate / suppliers.length).toFixed(2);
    }

    async loadInventoryData() {
        try {
            this.inventory = await this.dataCollectionService.getInventoryItems().toPromise() || [];
        } catch (error) {
            console.error('Error loading inventory data:', error);
            this.inventory = [];
        }
    }

    async loadOrderData() {
        try {
            this.orders = await this.dataCollectionService.getAllOrderData().toPromise() || [];
            console.log('whats in my orders', this.orders)
        } catch (error) {
            console.error('Error loading order data:', error);
            this.orders = [];
        }
    }

    topSuppliersData: any[] = [];

    calculateTopSuppliers(): any[] {
        // Step 1: Group data by supplier ID
        const groupedData = this.originalData.reduce(
            (groups, item) => {
                const id = item['Supplier ID'];
                if (!groups[id]) {
                    groups[id] = [];
                }
                groups[id].push(item);
                return groups;
            },
            {} as { [key: string]: SupplierData[] },
        );

        // Step 2: Calculate aggregates for each supplier
        const supplierAggregates = Object.entries(groupedData).map(([supplierId, data]) => {
            const totalSpent = data.reduce((sum, item) => sum + parseFloat(item.TotalSpent), 0);
            const averageOnTimeDelivery =
                data.reduce((sum, item) => sum + item['On Time Delivery Rate'], 0) / data.length;
            const averageOrderAccuracy = data.reduce((sum, item) => sum + item['Order Accuracy Rate'], 0) / data.length;
            const averageOutstandingPayments =
                data.reduce((sum, item) => sum + item['Out Standing Payments'], 0) / data.length;

            const score =
                averageOnTimeDelivery + averageOrderAccuracy - averageOutstandingPayments / 1000 + totalSpent / 100000;

            return {
                supplierId,
                totalSpent,
                averageOnTimeDelivery,
                averageOrderAccuracy,
                averageOutstandingPayments,
                score,
            };
        });

        // Step 3: Sort by score and select the top 3
        return supplierAggregates
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

    async loadSuppliersData() {
        try {
            this.isLoading = true;
            const data = await this.dataCollectionService.getSupplierReportData().toPromise();
            if (data && data.length > 0) {
                this.originalData = data;
                this.rowData = this.processRowData(this.originalData);
                console.log('Processed suppliers:', this.originalData);
                await this.fetchMetrics(this.originalData);
                // this.updateReportMetrics();
            } else {
                console.warn('No supplier data received');
                this.originalData = [];
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadSuppliersData:', error);
            this.originalData = [];
            this.rowData = [];
        } finally {
            this.isLoading = false;
        }
    }

    private updateReportMetrics() {
        if (this.originalData.length > 0 && this.orderFulfillmentDetails.length > 0) {
            const averageScores = this.calculateAverageSupplierPerformanceScore();
            
            this.SupplierReport.metrics = this.SupplierReport.metrics.map(metric => {
                let value: string | number = '0';
                switch (metric.name) {
                    case 'Average supplier performance':
                        value = this.getMostAverageSupplier();
                        break;
                    case 'Overall product defect rate':
                        value = this.calculateDefectRate(this.orderFulfillmentDetails) + '%';
                        break;
                    case 'Worst performer':
                        const worstPerformer = this.getWorstPerformingSupplier();
                        value = worstPerformer ? worstPerformer['Supplier ID'] : 'None at the moment';
                        break;
                    case 'Average delivery rate':
                        value = this.calculateAverageDeliveryRate() + '%';
                        break;
                    case 'Fill Rate':
                        value = this.calculateOrderFulfillmentRate(this.orderFulfillmentDetails) + '%';
                        break;
                    case 'Total inventory turnover':
                        value = this.calculateInventoryTurnover(this.stockRequests, this.initialInventory, this.endingInventory);
                        break;
                    case '"Right First Time" Rate':
                        value = this.calculateRightFirstTimeRate(this.orderFulfillmentDetails).toFixed(2) + '%';
                        break;
                    case 'On-time Order Completion Rate':
                        value = this.calculateOnTimeOrderCompletionRate() + '%';
                        break;
                    case 'Average Supplier Performance Score':
                        if (Object.keys(averageScores).length > 0) {
                            value = (Object.values(averageScores).reduce((a, b) => a + b, 0) / Object.values(averageScores).length).toFixed(2);
                        }
                        break;
                }
                return { ...metric, value: value.toString() === 'NaN' || value === undefined ? '0' : value };
            });
        } else {
            this.SupplierReport.metrics = this.SupplierReport.metrics.map(metric => ({ ...metric, value: '0' }));
        }
    }

    rowData: any[] = [];
    lineBarData!: ChartData;

    processData(): void {
        const groupedData = this.groupDataByTopSupplier();
        const formattedData = this.formatDataForChart(groupedData);
        this.lineBarData = { source: formattedData.source };
        // Now pass formattedData to LineBarComponent via its @Input() property
    }

    groupDataByTopSupplier(): SupplierData[] {
        // Step 1: Group data by supplier ID
        const groupedData = this.originalData.reduce(
            (groups, item) => {
                const id = item['Supplier ID'];
                if (!groups[id]) {
                    groups[id] = [];
                }
                groups[id].push(item);
                return groups;
            },
            {} as { [key: string]: SupplierData[] },
        );

        // Step 2: Calculate total spent for each supplier
        const supplierTotals = Object.entries(groupedData).map(([supplierId, data]) => {
            const totalSpent = data.reduce((sum, item) => sum + parseFloat(item.TotalSpent), 0);
            return {
                supplierId,
                totalSpent,
                data: data[0], // Take the first item as representative
            };
        });

        // Step 3: Sort by total spent and select top 5
        return supplierTotals
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5)
            .map((supplier) => ({
                ...supplier.data,
                TotalSpent: supplier.totalSpent.toString(),
                count: groupedData[supplier.supplierId].length,
            }));
    }

    formatDataForChart(data: any[]): any {
        // Extract years directly from the data parameter instead of the whole dataset to match exactly the top suppliers
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

    processRowData(rawData: any[]): any[] {
        const groupedData = this.groupDataBySupplier(rawData);
        console.log('groupedData', groupedData);
        return this.prepareRowData(groupedData);
    }

    private groupDataBySupplier(rawData: any[]): Map<string, any[]> {
        const grouped = new Map<string, any[]>();

        rawData.forEach((item) => {
            const group = grouped.get(item['Supplier ID']) || [];
            group.push(item);
            grouped.set(item['Supplier ID'], group);
        });

        // Sort each group by date in descending order to get the most recent first
        grouped.forEach((value, key) => {
            value.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
        });

        return grouped;
    }

    private prepareRowData(groupedData: Map<string, any[]>): any[] {
        let preparedData: any[] = [];

        // Prepare data to include only the most recent record initially with all available dates
        groupedData.forEach((value, key) => {
            let dates = value.map((item) => item.Date);
            let mostRecentRecord = { ...value[0], Dates: dates }; // Clone the most recent record and add all dates
            preparedData.push(mostRecentRecord);
        });
        console.log('the preparedRowData', preparedData);
        return preparedData;
    }

    async loadStockRequest() {
        try {
            const suppliers = (await this.dataCollectionService.getStockRequests().toPromise()) || [];
            this.stockRequests = suppliers;
        } catch (error) {
            console.error('Error in loadSuppliersData:', error);
            this.stockRequests = [];
        }
    }

    stockRequests: any[] = [];

    async loadSupplierMetrics() {
        try {
            this.dataCollectionService.getInventoryItems().subscribe(
                (response) => {
                    console.log('Response from InventoryService:', response);
                    // Process the response here
                    console.log('Processed inventory items:', this.rowData);
                },
                (error) => {
                    console.error('Error fetching inventory data:', error);
                    this.rowData = [];
                },
            );
        } catch (error) {
            console.error('Error in loadSupplierMetrics:', error);
            this.rowData = [];
        }
    }

    calculateAverage(column: any): number {
        const sum = this.rowData.reduce((acc, row) => acc + row[column], 0);
        return sum / this.rowData.length;
    }

    calculateTotal(column: any): number {
        const sum = this.rowData.reduce((acc, row) => acc + row[column], 0);
        return sum;
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
