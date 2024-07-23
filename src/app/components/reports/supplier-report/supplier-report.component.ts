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
        LoadingSpinnerComponent
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

    rowData: any[] = [];
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

    tiles = [
        { icon: 'schedule', iconLabel: 'On-Time Delivery', metricName: 'On-Time Delivery Rate', value: '95%', additionalInfo: 'High reliability' },
        { icon: 'check_circle', iconLabel: 'Order Accuracy', metricName: 'Order Accuracy Rate', value: '98%', additionalInfo: 'Very accurate' },
        { icon: 'repeat', iconLabel: 'Reorder Level', metricName: 'Reorder Level', value: '50 units', additionalInfo: 'Low stock warning' },
        { icon: 'attach_money', iconLabel: 'Total Spend', metricName: 'Total Spend', value: '$25,000', additionalInfo: 'Last quarter' },
        { icon: 'money_off', iconLabel: 'Outstanding Payments', metricName: 'Outstanding Payments', value: '$5,000', additionalInfo: 'Due next month' },
        { icon: 'warning', iconLabel: 'Risk Score', metricName: 'Risk Score', value: 'Low Risk', additionalInfo: 'Stable' }
    ];

    currentIndex = 0;

    showNextTiles() {
      this.currentIndex += 3;
      if (this.currentIndex >= this.tiles.length) {
        this.currentIndex = 0;  // Wrap around to the start
      }
    }

    async ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
        await this.loadSuppliersData();
    }

    colDefs!: ColDef[];

    getCurrentRoute() {
        this.colDefs = [
            { field: 'Supplier ID', headerName: 'Supplier ID' },
            { field: 'Date', headerName: 'Date' },
            { field: 'On Time Delivery Rate', headerName: 'On Time Delivery Rate' },
            { field: 'Order Accuracy Rate', headerName: 'Order Accuracy Rate' },
            { field: 'Out Standing Payments', headerName: 'Out Standing Payments' },
            { field: 'Reorder Level', headerName: 'Reorder Level' },
            { field: 'RiskScore', headerName: 'RiskScore' },
            { field: 'TotalSpent', headerName: 'TotalSpent' },
        ];
        return 'Supplier Report';
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
                this.supplierIds = suppliers.map((supplier: any) => ({
                    supplierID: supplier.supplierID,
                }));
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

            if (responseBody.statusCode === 200) {
                const inventoryItems = JSON.parse(responseBody.body);
                this.rowData = inventoryItems.map((item: any) => ({
                    inventoryID: item.inventoryID,
                    sku: item.SKU,
                    productId: item.productID,
                    description: item.description,
                    quantity: item.quantity,
                    supplier: item.supplier,
                }));
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
