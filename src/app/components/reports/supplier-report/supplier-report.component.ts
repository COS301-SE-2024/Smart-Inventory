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
        await this.loadSuppliersData();

        if (this.originalData.length > 0) {
            this.chartData = this.getChartData();
            console.log('chartdata:', this.chartData.seriesData);
            this.processData();
            this.topSuppliersData = this.calculateTopSuppliers();
            console.log('supplier data:', this.topSuppliersData);
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

    orderFulfillmentDetails: any[] = [
        {
            OrderID: 'ORD001',
            SupplierID: 'SUP001',
            QuoteID: 'QT001',
            UPC: '012345678901',
            OrderedQuantity: 100,
            DeliveredQuantity: 100,
            ItemCondition: 'Good',
            OrderDate: new Date('2024-07-01'),
            DeliveryDate: new Date('2024-07-03'),
            Category: 'Electronics',
        },
        {
            OrderID: 'ORD002',
            SupplierID: 'SUP002',
            QuoteID: 'QT002',
            UPC: '012345678902',
            OrderedQuantity: 200,
            DeliveredQuantity: 190,
            ItemCondition: 'Critical',
            OrderDate: new Date('2024-07-02'),
            DeliveryDate: new Date('2024-07-04'),
            Category: 'Appliances',
        },
        {
            OrderID: 'ORD003',
            SupplierID: 'SUP003',
            QuoteID: 'QT003',
            UPC: '012345678903',
            OrderedQuantity: 150,
            DeliveredQuantity: 145,
            ItemCondition: 'Minor',
            OrderDate: new Date('2024-07-01'),
            DeliveryDate: new Date('2024-07-03'),
            Category: 'Furniture',
        },
        {
            OrderID: 'ORD004',
            SupplierID: 'SUP004',
            QuoteID: 'QT004',
            UPC: '012345678904',
            OrderedQuantity: 120,
            DeliveredQuantity: 120,
            ItemCondition: 'Good',
            OrderDate: new Date('2024-07-02'),
            DeliveryDate: new Date('2024-07-05'),
            Category: 'Electronics',
        },
        {
            OrderID: 'ORD005',
            SupplierID: 'SUP005',
            QuoteID: 'QT005',
            UPC: '012345678905',
            OrderedQuantity: 300,
            DeliveredQuantity: 290,
            ItemCondition: 'Major',
            OrderDate: new Date('2024-07-03'),
            DeliveryDate: new Date('2024-07-06'),
            Category: 'Tools',
        },
    ];

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

        return ((totalDelivered / totalOrdered) * 100).toFixed(2); // Returns the fulfillment rate as a percentage
    }

    calculateDefectRate(details: any[]): string {
        let totalItemsReceived = 0;
        let defectiveItems = 0;

        details.forEach((detail) => {
            totalItemsReceived += detail.DeliveredQuantity;
            // Consider any condition that is not 'Good' as defective
            if (detail.ItemCondition !== 'Good') {
                defectiveItems += detail.DeliveredQuantity;
            }
        });

        return ((defectiveItems / totalItemsReceived) * 100).toFixed(2); // Returns the defect rate as a percentage
    }

    calculateRightFirstTimeRate(details: any[]): number {
        let totalOrders = details.length;
        let rightFirstTimeCount = details.filter(
            (detail) => detail.DeliveredQuantity === detail.OrderedQuantity && detail.ItemCondition === 'Good',
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
    getMostAverageSupplier(): any {
        const suppliers = this.originalData;
        console.log('The suppliers:', suppliers);

        const averages = this.calculateAverages(suppliers);
        console.log('My averages:', averages);

        let mostAverageSupplier = null;
        let smallestDifference = Infinity; // Start with a large number that any real difference will be smaller than

        suppliers.forEach((supplier) => {
            // Safely access properties
            const onTimeRate =
                typeof supplier['On Time Delivery Rate'] === 'number' ? supplier['On Time Delivery Rate'] : null;
            const accuracyRate =
                typeof supplier['Order Accuracy Rate'] === 'number' ? supplier['Order Accuracy Rate'] : null;

            if (onTimeRate === null || accuracyRate === null) {
                console.error('Invalid data encountered, skipping supplier:', supplier);
                return; // Continue to the next supplier in the forEach loop
            }

            // Calculate the absolute percentage differences
            const onTimeDiff = Math.abs(
                ((onTimeRate - averages.onTimeDeliveryRate) / averages.onTimeDeliveryRate) * 100,
            );
            const accuracyDiff = Math.abs(
                ((accuracyRate - averages.orderAccuracyRate) / averages.orderAccuracyRate) * 100,
            );
            const totalDifference = onTimeDiff + accuracyDiff; // Simple sum of differences

            // Check if this supplier has the smallest difference so far
            if (totalDifference < smallestDifference) {
                smallestDifference = totalDifference;
                mostAverageSupplier = supplier;
            }
        });
        console.log('Most Average Supplier:', mostAverageSupplier);
        if (mostAverageSupplier) {
            return mostAverageSupplier['Supplier ID'];
        }

        return mostAverageSupplier;
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
            this.dataCollectionService.getInventoryItems().subscribe(
                (inventoryItems) => {
                    // this.rowData = inventoryItems.map((item: any) => ({
                    //     inventoryID: item.inventoryID,
                    //     sku: item.SKU,
                    //     category: item.category,
                    //     productId: item.productID,
                    //     description: item.description,
                    //     quantity: item.quantity,
                    //     supplier: item.supplier,
                    //     expirationDate: item.expirationDate,
                    //     lowStockThreshold: item.lowStockThreshold,
                    //     reorderFreq: item.reorderFreq,
                    //     requests: 0,
                    //     requestsQuantity: 0,
                    // }));
                    console.log('my inventory :', inventoryItems);
                },
                (error) => {
                    console.error('Error fetching inventory data:', error);
                    this.rowData = [];
                },
            );
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
            this.rowData = [];
        }
        const inventoryData = [
            {
                inventoryID: 'bc9040cb-3834-4391-9ab7-153968c1d13a',
                tenentId: '1717667019559-j85syk',
                category: 'Food: Perishable',
                createdAt: '2024-08-05T13:14:26.211Z',
                description: 'Maize Meal - Super Fine, 5kg',
                expirationDate: '2024-09-24T22:00:00.000Z',
                lowStockThreshold: 20,
                quantity: 72,
                reorderFreq: 30,
                SKU: 'MS-301',
                supplier: 'Foodcorp',
                upc: '6001070000000',
                updatedAt: '2024-08-05T13:14:26.211Z',
                condition: 'good',
            },
            {
                inventoryID: '7860ac1c-9b39-4c9b-bf2f-1efbb87cbdf3',
                tenentId: '1717667019559-j85syk',
                category: 'Beverages: Non-Alcoholic',
                createdAt: '2024-08-05T13:17:16.112Z',
                description: 'Amarula Cream Liqueur, 750ml',
                expirationDate: '2024-08-07T22:00:00.000Z',
                lowStockThreshold: 15,
                quantity: 48,
                reorderFreq: 15,
                SKU: 'AM-405',
                supplier: 'Eskort',
                upc: '6009880000000',
                updatedAt: '2024-08-05T13:17:16.112Z',
                condition: 'moderate',
            },
            {
                inventoryID: '1525c187-b594-4992-96a7-6acd0e1c1901',
                tenentId: '1717667019559-j85syk',
                category: 'Food: Perishable',
                createdAt: '2024-08-05T13:11:38.253Z',
                description: 'Rooibos Tea - Organic, 40 Bags',
                expirationDate: '2024-08-30T22:00:00.000Z',
                lowStockThreshold: 10,
                quantity: 52,
                reorderFreq: 7,
                SKU: 'RO-102',
                supplier: 'BOS Brands',
                upc: '6009180000000',
                updatedAt: '2024-08-05T13:11:38.253Z',
                condition: 'good',
            },
            {
                inventoryID: '97053b80-40f0-416e-8844-5a65bce1c577',
                tenentId: '1',
                category: 'Sample Category',
                createdAt: '2024-08-05T11:50:03.967Z',
                description: 'Sample Product',
                expirationDate: '2024-07-02T00:00:00.000Z',
                lowStockThreshold: 10,
                quantity: 100,
                reorderFreq: 30,
                SKU: 'SAMPLE_SKU',
                supplier: 'Sample Supplier',
                upc: '6a9c12a1-22fc-4f6d-92ad-bc1c86c3466f',
                updatedAt: '2024-08-05T11:50:03.967Z',
                condition: 'bad',
            },
            {
                inventoryID: '6b51adf0-0716-467d-b566-84db02c9e7f4',
                tenentId: '1717667019559-j85syk',
                category: 'Food: Perishable',
                createdAt: '2024-08-05T13:05:53.445Z',
                description: 'Biltong Snapstix - Original Beef',
                expirationDate: '2024-08-30T22:00:00.000Z',
                lowStockThreshold: 10,
                quantity: 54,
                reorderFreq: 7,
                SKU: 'BF-001',
                supplier: 'Fredy Hirsch Brands',
                upc: '6001010000000',
                updatedAt: '2024-08-05T13:05:53.445Z',
                condition: 'moderate',
            },
        ];

        return inventoryData;
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
                this.updateReportMetrics();
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
        if (this.originalData.length > 0) {
            this.SupplierReport.metrics[0].value = this.getMostAverageSupplier();
            this.SupplierReport.metrics[1].value = this.calculateDefectRate(this.orderFulfillmentDetails);
            this.SupplierReport.metrics[2].value = this.getWorstPerformingSupplier()['Supplier ID'];
            this.SupplierReport.metrics[3].value = this.calculateAverageDeliveryRate();
            this.SupplierReport.metrics[4].value = this.calculateOrderFulfillmentRate(this.orderFulfillmentDetails);
            this.SupplierReport.metrics[5].value = this.calculateInventoryTurnover(
                this.stockRequests,
                this.initialInventory,
                this.endingInventory,
            );
            this.SupplierReport.metrics[6].value = this.calculateRightFirstTimeRate(this.orderFulfillmentDetails);
            this.SupplierReport.metrics[7].value = this.calculateOnTimeOrderCompletionRate();
        } else {
            console.warn('No data available to update report metrics');
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
