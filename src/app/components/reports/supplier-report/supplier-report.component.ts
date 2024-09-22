import { TitleService } from '../../header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { SaleschartComponent } from '../../charts/saleschart/saleschart.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { LoadingSpinnerComponent } from '../../loader/loading-spinner.component';
import { DateSelectCellEditorComponent } from './date-select-cell-editor.component';
import { RoleSelectCellEditorComponent } from '../../../pages/team/role-select-cell-editor.component';
import { LineBarComponent } from '../../charts/line-bar/line-bar.component';
import { LineComponent } from '../../charts/line/line.component';
import { RadarComponent } from '../../charts/radar/radar.component';
import { RowNode } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridsterModule, GridType } from 'angular-gridster2';
import { InventoryService } from '../../../../../amplify/services/inventory.service';

type ChartMetric = 'On Time Delivery Rate' | 'Order Accuracy Rate' | 'Out Standing Payments' | 'TotalSpent';
type ChartData = {
    source: any[];
};
@Component({
    selector: 'app-supplier-report',
    standalone: true,
    imports: [
        GridComponent,
        MatCardModule,
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
        GridsterModule,
    ],
    templateUrl: './supplier-report.component.html',
    styleUrl: './supplier-report.component.css',
})
export class SupplierReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
        private inventoryService: InventoryService
    ) {
        Amplify.configure(outputs);
    }

    visibleTiles: any[] = []; // Holds the tiles currently being displayed
    currentIndex = 0;
    chartData: any;
    initialInventory: number = 500; // Starting inventory at the beginning of the period
    endingInventory: number = 600; // Ending inventory at the end of the period

    options: GridsterConfig = {
        gridType: GridType.VerticalFixed,
        displayGrid: DisplayGrid.None,
        compactType: CompactType.CompactUpAndLeft,
        margin: 10,
        outerMargin: true,
        outerMarginTop: null,
        outerMarginRight: null,
        outerMarginBottom: null,
        outerMarginLeft: null,
        useTransformPositioning: true,
        mobileBreakpoint: 640,
        minCols: 12,
        maxCols: 12,
        minRows: 6,
        maxRows: 100,
        maxItemCols: 100,
        minItemCols: 1,
        maxItemRows: 100,
        minItemRows: 1,
        maxItemArea: 2500,
        minItemArea: 1,
        defaultItemCols: 1,
        defaultItemRows: 1,
        fixedColWidth: 105,
        fixedRowHeight: 105,
        keepFixedHeightInMobile: false,
        keepFixedWidthInMobile: false,
        scrollSensitivity: 10,
        scrollSpeed: 20,
        enableEmptyCellClick: false,
        enableEmptyCellContextMenu: false,
        enableEmptyCellDrop: false,
        enableEmptyCellDrag: false,
        enableOccupiedCellDrop: false,
        emptyCellDragMaxCols: 50,
        emptyCellDragMaxRows: 50,
        ignoreMarginInRow: false,
        draggable: {
            enabled: false,
        },
        resizable: {
            enabled: false,
        },
        swap: false,
        pushItems: true,
        disablePushOnDrag: false,
        disablePushOnResize: false,
        pushDirections: { north: true, east: true, south: true, west: true },
        pushResizeItems: false,
        disableWindowResize: false,
        disableWarnings: false,
        scrollToNewItems: false,
    };

    items: Array<GridsterItem> = [
        { cols: 8, rows: 6, y: 0, x: 0 },
        { cols: 4, rows: 5, y: 2, x: 0 },
        { cols: 12, rows: 4, y: 2, x: 2 },
        { cols: 6, rows: 4, y: 4, x: 0 },
        { cols: 6, rows: 4, y: 4, x: 4 },
        { cols: 12, rows: 2, y: 0, x: 0 },
    ];
    startIndex = 0;
    scrollTiles(direction: 'left' | 'right') {
        if (direction === 'left') {
            this.startIndex = (this.startIndex - 1 + this.tiles.length) % this.tiles.length;
        } else {
            this.startIndex = (this.startIndex + 1) % this.tiles.length;
        }
        this.updateVisibleMetrics();
    }

    private updateVisibleMetrics() {
        this.visibleTiles = [];
        for (let i = 0; i < 3; i++) {
            const index = (this.startIndex + i) % this.tiles.length;
            this.visibleTiles.push(this.tiles[index]);
        }
    }

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

        this.loadSupplierMetrics();
        await this.fetchMetrics(this.rowData);
        //console.log(this.getMostAverageSupplier()['Supplier ID']);
        //console.log(this.getWorstPerformingSupplier()['Supplier ID']);
        //console.log(this.calculateAverageDeliveryRate());
        //console.log(this.calculateOnTimeOrderCompletionRate());
        this.updateVisibleMetrics();
        this.SupplierReport.metrics[0].value = this.getMostAverageSupplier()['Supplier ID'];
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
        // console.log(this.getChartData());
        // console.log(this.visibleTiles);
        this.chartData = this.getChartData();
        console.log('chartdata:', this.chartData.seriesData);
        this.processData();
        this.inventory = await this.loadInventoryData();
        this.topSuppliersData = this.calculateTopSuppliers();
        console.log('supplier data:', this.topSuppliersData);
        // console.log('inventory ', this.inventory)
        // console.log('my defect rate', this.calculateDefectRate(this.orderFulfillmentDetails));
        // console.log('my rowData', this.rowData)
        this.isLoading = false;
    }

    colDefs!: ColDef[];
    originalData: any[] = [];

    getCurrentRoute() {
        this.colDefs = [
            { field: 'Supplier ID', headerName: 'Supplier ID', filter: 'agSetColumnFilter' },
            {
                field: 'Date',
                headerName: 'Date',
                filter: 'agSetColumnFilter',
            },
            { field: 'On Time Delivery Rate', headerName: 'On Time Delivery Rate', filter: 'agSetColumnFilter' },
            { field: 'Order Accuracy Rate', headerName: 'Order Accuracy Rate', filter: 'agSetColumnFilter' },
            { field: 'Out Standing Payments', headerName: 'Out Standing Payments', filter: 'agSetColumnFilter' },
            { field: 'Reorder Level', headerName: 'Reorder Level', filter: 'agSetColumnFilter' },
            { field: 'RiskScore', headerName: 'Risk Score', filter: 'agSetColumnFilter' },
            { field: 'TotalSpent', headerName: 'Total Spent', filter: 'agSetColumnFilter' },
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

    onDateChange(supplierId: string, newDate: string): void {
        // const updatedData = this.originalData.find(item =>
        //     item['Supplier ID'] === supplierId && item['Date'] === newDate
        // );
        // if (updatedData) {
        //     const rowIndex = this.rowData.findIndex(row => row['Supplier ID'] === supplierId);
        //     if (rowIndex !== -1) {
        //         this.rowData[rowIndex] = { ...updatedData };
        //         const rowNode = this.gridComponent.api.getRowNode(rowIndex.toString());
        //         if (rowNode) {
        //             this.gridComponent.api.refreshCells({
        //                 rowNodes: [rowNode],
        //                 force: true
        //             });
        //         } else {
        //             console.warn(`Row node not found for index ${rowIndex}`);
        //             // Optionally, refresh the entire grid if the specific row can't be found
        //             this.gridComponent.api.refreshCells({ force: true });
        //         }
        //     }
        // }
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
            console.log(data);
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
                    this.createTile('attach_money', 'Total Spend', 'Total Spent', supplier['TotalSpent'].toString()),
                    this.createTile(
                        'money_off',
                        'Outstanding Payments',
                        'Outstanding Payments',
                        supplier['Out Standing Payments'].toString(),
                    ),
                    this.createTile('warning', 'Risk Score', 'Risk Score', supplier['RiskScore']),
                );
            });
        } catch (error) {
            console.log('Error fetching metrics');
        } finally {
            // // this.isLoading = false;
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
        // console.log('The suppliers:', suppliers);

        const averages = this.calculateAverages(suppliers);
        // console.log("My averages:", averages);

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

        if (mostAverageSupplier) {
            return mostAverageSupplier['Supplier ID'];
        }

        // console.log("Most Average Supplier:", mostAverageSupplier);
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
        // Step 1: Aggregate data for each supplier
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

    async loadSuppliersData() {
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
                this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getSupplierReportData',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const suppliers = JSON.parse(responseBody.body);
                // this.supplierIds = suppliers.map((supplier: any) => ({
                //     supplierID: supplier.supplierID,
                // }));
                this.originalData = suppliers;
                this.rowData = this.processRowData(this.originalData);

                console.log('Processed suppliers:', this.rowData);
            } else {
                console.error('Error fetching suppliers data:', responseBody.body);
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadSuppliersData:', error);
            this.rowData = [];
        } finally {
            // // this.isLoading = false;
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

    groupDataByTopSupplier(): any {
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

        return preparedData;
    }

    stockRequests: any[] = [
        {
            stockRequestId: '001',
            tenentId: '1001',
            category: 'Electronics',
            createdAt: '2024-01-01T10:00:00.000Z',
            quantityRequested: 100,
            quantityFulfilled: 95,
            sku: 'ELEC-001',
            supplier: 'SupplierA',
            type: 'STOCK_REQUEST',
        },
        {
            stockRequestId: '002',
            tenentId: '1001',
            category: 'Appliances',
            createdAt: '2024-01-02T10:00:00.000Z',
            quantityRequested: 50,
            quantityFulfilled: 50,
            sku: 'APPL-002',
            supplier: 'SupplierB',
            type: 'STOCK_REQUEST',
        },
        {
            stockRequestId: '003',
            tenentId: '1001',
            category: 'Tools',
            createdAt: '2024-01-03T10:00:00.000Z',
            quantityRequested: 30,
            quantityFulfilled: 30,
            sku: 'TOOL-003',
            supplier: 'SupplierC',
            type: 'STOCK_REQUEST',
        },
    ];

    async loadSupplierMetrics() {
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
                this.rowData = [];
                return;
            }
    
            // Use the InventoryService to get inventory items
            this.inventoryService.getInventoryItems(tenantId).subscribe(
                (response) => {
                    console.log('Response from InventoryService:', response);
                    // Process the response here
                    // this.rowData = response;
                    console.log('Processed inventory items:', this.rowData);
                },
                (error) => {
                    console.error('Error fetching inventory data:', error);
                    this.rowData = [];
                }
            );
        } catch (error) {
            console.error('Error in loadSupplierMetrics:', error);
            this.rowData = [];
        } finally {
            // this.isLoading = false;
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
