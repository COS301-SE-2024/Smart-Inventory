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
import { RowNode } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';

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
        RoleSelectCellEditorComponent
    ],
    templateUrl: './supplier-report.component.html',
    styleUrl: './supplier-report.component.css',
})
export class SupplierReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        Amplify.configure(outputs);

    }

    visibleTiles: any[] = []; // Holds the tiles currently being displayed
    currentIndex = 0;

    updateVisibleTiles() {
        this.visibleTiles = this.tiles.slice(this.currentIndex, this.currentIndex + 4);
    }

    scrollTiles(direction: 'left' | 'right') {
        if (direction === 'left' && this.currentIndex > 0) {
            this.currentIndex--;
        } else if (direction === 'right' && this.currentIndex < this.tiles.length - 4) {
            this.currentIndex++;
        }
        this.updateVisibleTiles();
    }

    automation: boolean = true;
    @ViewChild('gridComponent') gridComponent!: GridComponent;
    // rowData: any[] = [];
    supplierIds: any[] = [];
    isLoading = true;

    selectedItem: any = null;
    requestQuantity: number | null = null;

    SupplierReport = {
        title: 'Order Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            metric_1: 'Average supplier performance: ',
            metric_2: 'Overall product defect rate: ',
            metric_3: 'Worst performer: ',
            metric_4: 'Average delivery rate: ',
            metric_5: 'Fill Rate: ',
            metric_6: 'Total inventory turnover: ',
            metric_7: 'Critical/Major/Minor Defect Rate:',
            metric_8: '“Right First Time” Rate:',
            metric_9: 'On-time Order Completion Rate:',
        },
        graphs: [],
    };

    tiles: any[] = [];

    // currentIndex = 0;

    showNextTiles() {
        this.currentIndex += 3;
        if (this.currentIndex >= this.tiles.length) {
            this.currentIndex = 0;  // Wrap around to the start
        }
    }

    async ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
        await this.loadSuppliersData();

        this.loadSupplierMetrics();
        await this.fetchMetrics(this.rowData);
        console.log(this.getMostAverageSupplier()['Supplier ID']);
        console.log(this.getWorstPerformingSupplier()['Supplier ID'])
        console.log(this.calculateAverageDeliveryRate(this.originalData))
        console.log(this.calculateOnTimeOrderCompletionRate(this.originalData))
        this.updateVisibleTiles();
        // console.log(this.visibleTiles);
    }

    colDefs!: ColDef[];
    originalData: any[] = [];

    getCurrentRoute() {
        this.colDefs = [
            { field: 'Supplier ID', headerName: 'Supplier ID' },
            {
                field: 'Date',
                headerName: 'Role',
                cellEditor: DateSelectCellEditorComponent,  // Make sure this is set if it should be editable
                cellRenderer: DateSelectCellEditorComponent
            },
            { field: 'On Time Delivery Rate', headerName: 'On Time Delivery Rate' },
            { field: 'Order Accuracy Rate', headerName: 'Order Accuracy Rate' },
            { field: 'Out Standing Payments', headerName: 'Out Standing Payments' },
            { field: 'Reorder Level', headerName: 'Reorder Level' },
            { field: 'RiskScore', headerName: 'RiskScore' },
            { field: 'TotalSpent', headerName: 'TotalSpent' },
        ];
        return 'Supplier Report';
    }

    getUniqueSuppliers(data: any[]): any[] {
        const uniqueSuppliers: any[] = [];
        data.forEach(item => {
            if (!uniqueSuppliers[item['Supplier ID']]) {
                uniqueSuppliers[item['Supplier ID']] = item;
            }
        });
        return Object.values(uniqueSuppliers);
    }

    getAvailableDates(supplierId: string): string[] {
        return this.originalData
            .filter(item => item['Supplier ID'] === supplierId)
            .map(item => item['Date']);
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
        return this.rowData.find(row => row['Supplier ID'] === supplierId && row.Date === date);
    }

    // getAvailableDates(supplierId: string): string[] {
    //     return this.rowData
    //         .filter(row => row['Supplier ID'] === supplierId)
    //         .map(row => row.Date);
    // }


    async fetchMetrics(data: any[]) {
        try {
            console.log(data);
            data.forEach((supplier) => {
                this.tiles.push(
                    this.createTile('schedule', 'On-Time Delivery', 'On Time Delivery Rate', supplier['On Time Delivery Rate'].toString()),
                    this.createTile('check_circle', 'Order Accuracy', 'Order Accuracy Rate', supplier['Order Accuracy Rate'].toString()),
                    this.createTile('repeat', 'Reorder Level', 'Reorder Level', supplier['Reorder Level']),
                    this.createTile('attach_money', 'Total Spend', 'Total Spent', supplier['TotalSpent'].toString()),
                    this.createTile('money_off', 'Outstanding Payments', 'Outstanding Payments', supplier['Out Standing Payments'].toString()),
                    this.createTile('warning', 'Risk Score', 'Risk Score', supplier['RiskScore'])
                );
            });
        } catch (error) {
            console.log('Error fetching metrics');
        } finally {
            this.isLoading = false;
        }

    }

    private createTile(icon: string, iconLabel: string, metricName: string, value: string): any {
        return {
            icon: icon,
            iconLabel: iconLabel,
            metricName: metricName,
            value: value,
            additionalInfo: this.determineAdditionalInfo(metricName, value)
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

        const total = suppliers.reduce((acc, curr) => {
            // console.log("Current item:", curr); // Check what each supplier item looks like

            // Access properties correctly using bracket notation if they include spaces
            const onTimeRate = typeof curr['On Time Delivery Rate'] === 'number' ? curr['On Time Delivery Rate'] : 0;
            const accuracyRate = typeof curr['Order Accuracy Rate'] === 'number' ? curr['Order Accuracy Rate'] : 0;

            if (onTimeRate === 0 || accuracyRate === 0) {
                console.error("Invalid data for supplier:", curr);
            }

            return {
                onTimeDeliveryRate: acc.onTimeDeliveryRate + onTimeRate,
                orderAccuracyRate: acc.orderAccuracyRate + accuracyRate,
            };
        }, { onTimeDeliveryRate: 0, orderAccuracyRate: 0 });

        if (suppliers.length === 0) {
            console.error("No suppliers provided to calculate averages.");
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

        suppliers.forEach(supplier => {
            // Safely access properties
            const onTimeRate = typeof supplier['On Time Delivery Rate'] === 'number' ? supplier['On Time Delivery Rate'] : null;
            const accuracyRate = typeof supplier['Order Accuracy Rate'] === 'number' ? supplier['Order Accuracy Rate'] : null;

            if (onTimeRate === null || accuracyRate === null) {
                console.error("Invalid data encountered, skipping supplier:", supplier);
                return; // Continue to the next supplier in the forEach loop
            }

            // Calculate the absolute percentage differences
            const onTimeDiff = Math.abs((onTimeRate - averages.onTimeDeliveryRate) / averages.onTimeDeliveryRate * 100);
            const accuracyDiff = Math.abs((accuracyRate - averages.orderAccuracyRate) / averages.orderAccuracyRate * 100);
            const totalDifference = onTimeDiff + accuracyDiff; // Simple sum of differences

            // Check if this supplier has the smallest difference so far
            if (totalDifference < smallestDifference) {
                smallestDifference = totalDifference;
                mostAverageSupplier = supplier;
            }
        });

        // console.log("Most Average Supplier:", mostAverageSupplier);
        return mostAverageSupplier;
    }

    getWorstPerformingSupplier(): any {
        const suppliers = this.originalData;
        console.log('The suppliers:', suppliers);

        let worstSupplier = null;
        let highestScore = -Infinity; // Start with a very low score that any real score will be higher than

        suppliers.forEach(supplier => {
            // Calculating performance score
            // We could also include risk assessment based on 'RiskScore' and 'Out Standing Payments'
            let performanceScore = (100 - supplier['On Time Delivery Rate']) +
                (100 - supplier['Order Accuracy Rate']) +
                (supplier['Out Standing Payments'] / 1000); // Example of scaling outstanding payments

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

    calculateAverageDeliveryRate(suppliers: any[]): number {
        // Initialize the sum and count variables
        let totalDeliveryRate = 0;
        let count = 0;

        // Iterate over each supplier entry
        suppliers.forEach(supplier => {
            // Check if the "On Time Delivery Rate" is present and is a number
            if (supplier && typeof supplier['On Time Delivery Rate'] === 'number') {
                totalDeliveryRate += supplier['On Time Delivery Rate'];
                count++;
            }
        });

        // Calculate the average delivery rate
        // Ensure we do not divide by zero
        const averageDeliveryRate = count > 0 ? totalDeliveryRate / count : 0;
        return averageDeliveryRate;
    }

    calculateOnTimeOrderCompletionRate(suppliers: any[]): number {
        const totalRate = suppliers.reduce((sum, supplier) => sum + supplier['On Time Delivery Rate'], 0);
        return totalRate / suppliers.length;
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
                FunctionName: 'getSuppliers',
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
                this.originalData = [
                    {
                        "Supplier ID": "S001",
                        "Date": "2021-07-23",
                        "On Time Delivery Rate": 92.0,
                        "Order Accuracy Rate": 97.5,
                        "Out Standing Payments": 3000,
                        "Reorder Level": "Medium",
                        "RiskScore": "Low",
                        "TotalSpent": 120000
                    },
                    {
                        "Supplier ID": "S001",
                        "Date": "2022-07-23",
                        "On Time Delivery Rate": 93.0,
                        "Order Accuracy Rate": 98.0,
                        "Out Standing Payments": 2000,
                        "Reorder Level": "Medium",
                        "RiskScore": "Low",
                        "TotalSpent": 130000
                    },
                    {
                        "Supplier ID": "S001",
                        "Date": "2023-07-23",
                        "On Time Delivery Rate": 94.0,
                        "Order Accuracy Rate": 99.0,
                        "Out Standing Payments": 1500,
                        "Reorder Level": "Medium",
                        "RiskScore": "Low",
                        "TotalSpent": 140000
                    },
                    {
                        "Supplier ID": "S002",
                        "Date": "2021-07-23",
                        "On Time Delivery Rate": 88.0,
                        "Order Accuracy Rate": 95.0,
                        "Out Standing Payments": 4500,
                        "Reorder Level": "High",
                        "RiskScore": "Moderate",
                        "TotalSpent": 110000
                    },
                    {
                        "Supplier ID": "S002",
                        "Date": "2022-07-23",
                        "On Time Delivery Rate": 89.0,
                        "Order Accuracy Rate": 96.0,
                        "Out Standing Payments": 4200,
                        "Reorder Level": "High",
                        "RiskScore": "Moderate",
                        "TotalSpent": 115000
                    },
                    {
                        "Supplier ID": "S002",
                        "Date": "2023-07-23",
                        "On Time Delivery Rate": 90.0,
                        "Order Accuracy Rate": 97.0,
                        "Out Standing Payments": 4000,
                        "Reorder Level": "High",
                        "RiskScore": "Moderate",
                        "TotalSpent": 120000
                    },
                    {
                        "Supplier ID": "S003",
                        "Date": "2021-07-23",
                        "On Time Delivery Rate": 85.0,
                        "Order Accuracy Rate": 90.0,
                        "Out Standing Payments": 5000,
                        "Reorder Level": "Low",
                        "RiskScore": "High",
                        "TotalSpent": 95000
                    },
                    {
                        "Supplier ID": "S003",
                        "Date": "2022-07-23",
                        "On Time Delivery Rate": 87.0,
                        "Order Accuracy Rate": 92.0,
                        "Out Standing Payments": 4800,
                        "Reorder Level": "Low",
                        "RiskScore": "High",
                        "TotalSpent": 100000
                    },
                    {
                        "Supplier ID": "S003",
                        "Date": "2023-07-23",
                        "On Time Delivery Rate": 89.0,
                        "Order Accuracy Rate": 94.0,
                        "Out Standing Payments": 4600,
                        "Reorder Level": "Low",
                        "RiskScore": "High",
                        "TotalSpent": 105000
                    }
                ]

                this.rowData = this.processRowData(this.originalData);

                console.log('Processed suppliers:', this.supplierIds);
            } else {
                console.error('Error fetching suppliers data:', responseBody.body);
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadSuppliersData:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
        }
    }

    rowData: any[] = [];

    processRowData(rawData: any[]): any[] {
        const groupedData = this.groupDataBySupplier(rawData);
        return this.prepareRowData(groupedData);
    }

    private groupDataBySupplier(rawData: any[]): Map<string, any[]> {
        const grouped = new Map<string, any[]>();

        rawData.forEach(item => {
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
            let dates = value.map(item => item.Date);
            let mostRecentRecord = { ...value[0], Dates: dates }; // Clone the most recent record and add all dates
            preparedData.push(mostRecentRecord);
        });

        return preparedData;
    }

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
            console.log('Response from Lambda:', responseBody);

            // if (responseBody.statusCode === 200) {
            //     const inventoryItems = JSON.parse(responseBody.body);
            //     // this.rowData = this.data;
            //     console.log('Processed inventory items:', this.rowData);
            // } else {
            //     console.error('Error fetching inventory data:', responseBody.body);
            //     this.rowData = [];
            // }
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
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
