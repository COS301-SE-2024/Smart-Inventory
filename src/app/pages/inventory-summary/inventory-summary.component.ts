import { Component, OnInit, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { TitleService } from 'app/components/header/title.service';
import { MaterialModule } from '../../components/material/material.module';
import { Router } from '@angular/router';
import { InventoryService } from '../../../../amplify/services/inventory.service';

@Component({
    selector: 'app-inventory-summary',
    standalone: true,
    imports: [GridComponent, MatButtonModule, MaterialModule, CommonModule, FormsModule, LoadingSpinnerComponent],
    templateUrl: './inventory-summary.component.html',
    styleUrls: ['./inventory-summary.component.css'],
})
export class InventorySummaryComponent implements OnInit {
    @ViewChild('gridComponent') gridComponent!: GridComponent;

    rowData: any[] = [];
    isLoading = true;
    tenentId: string = '';
    isCalculating = false;

    colDefs: ColDef[] = [
        {
            field: 'SKU',
            headerName: 'SKU',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Stock Keeping Unit - Unique identifier for each product',
        },
        {
            field: 'description',
            headerName: 'Description',
            filter: 'agSetColumnFilter',
            editable: true,
            headerTooltip: 'Brief description of the product',
        },
        {
            field: 'quantity',
            headerName: 'Quantity',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Current stock quantity of the item',
            cellStyle: (params) => {
                if (params.value <= params.data.lowStockThreshold) {
                    return { backgroundColor: '#FFCDD2' }; // Light red for low stock
                } else {
                    return { backgroundColor: '#E8F5E9' }; // Light green for normal stock
                }
            },
        },
        {
            field: 'lowStockThreshold',
            headerName: 'Low Stock Threshold',
            filter: 'agSetColumnFilter',
            editable: true,
            headerTooltip: 'Quantity at which stock is considered low and needs reordering',
        },
        {
            field: 'reorderAmount',
            headerName: 'Reorder Amount',
            filter: 'agSetColumnFilter',
            editable: true,
            headerTooltip: 'Quantity to reorder when stock reaches low threshold',
        },
        {
            field: 'EOQ',
            headerName: 'EOQ',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Economic Order Quantity - Optimal order quantity to minimize total costs',
        },
        {
            field: 'ROP',
            headerName: 'ROP',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Reorder Point - Stock level at which a new order should be placed',
        },
        {
            field: 'safetyStock',
            headerName: 'Safety Stock',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Extra stock kept to mitigate risk of stockouts',
        },
        {
            field: 'ABCCategory',
            headerName: 'ABC Category',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Product classification based on importance (A: High, B: Medium, C: Low)',
        },
        {
            field: 'annualConsumptionValue',
            headerName: 'Annual Consumption Value',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Total value of product consumed in a year',
            valueFormatter: (params) => Math.round(params.value).toString(),
        },
        {
            field: 'holdingCost',
            headerName: 'Holding Cost',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Cost of holding one unit of inventory for a year',
            valueFormatter: (params) => params.value.toFixed(2),
        },
        {
            field: 'annualDemand',
            headerName: 'Annual Demand',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Total quantity demanded in a year',
            valueFormatter: (params) => Math.round(params.value).toString(),
        },
        {
            field: 'dailyDemand',
            headerName: 'Daily Demand',
            filter: 'agSetColumnFilter',
            headerTooltip: 'Average quantity demanded per day',
            valueFormatter: (params) => params.value.toFixed(2),
        },
    ];

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
        private router: Router,
        private inventoryService: InventoryService,
    ) {
        Amplify.configure(outputs);
    }

    async ngOnInit(): Promise<void> {
        this.titleService.updateTitle('Inventory Summary');
        try {
            const session = await fetchAuthSession();
            this.tenentId = await this.getTenentId(session);
            if (!this.tenentId) {
                throw new Error('Unable to retrieve tenentId');
            }
            await this.loadInventorySummaryData();
        } catch (error) {
            console.error('Error initializing component:', error);
            this.snackBar.open(
                'Error initializing component: ' + (error instanceof Error ? error.message : String(error)),
                'Close',
                {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                },
            );
        }
    }

    async getTenentId(session: any): Promise<string> {
        const cognitoClient = new CognitoIdentityProviderClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials,
        });

        const getUserCommand = new GetUserCommand({
            AccessToken: session.tokens?.accessToken.toString(),
        });
        const getUserResponse = await cognitoClient.send(getUserCommand);

        const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

        if (!tenentId) {
            throw new Error('TenentId not found in user attributes');
        }

        console.log(tenentId);

        return tenentId;
    }

    async handleCellValueChanged(event: { data: any; field: string; newValue: any }) {
        try {
            const updatedData: any = {
                SKU: event.data.SKU,
                tenentId: this.tenentId,
                [event.field]: event.newValue,
            };

            // Convert to numbers if necessary
            if (event.field === 'lowStockThreshold' || event.field === 'reorderAmount') {
                updatedData[event.field] = Number(event.newValue);
            }

            const response = await this.inventoryService.inventorySummaryUpdateItem(updatedData).toPromise();

            if (response) {
                console.log('Item updated successfully');
                const updatedItem = response;

                // Update the local data to reflect the change
                const index = this.rowData.findIndex((item) => item.SKU === updatedItem.SKU);
                if (index !== -1) {
                    this.rowData[index] = { ...this.rowData[index], ...updatedItem };
                }

                this.snackBar.open('Item updated successfully', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            } else {
                throw new Error('Failed to update item');
            }
        } catch (error) {
            console.error('Error updating inventory Item:', error);

            // Revert the change in the grid
            this.gridComponent.updateRow(event.data);

            this.snackBar.open('Error updating inventory summary item: ' + (error as Error).message, 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    async loadInventorySummaryData() {
        try {
            this.isLoading = true;
            const response = await this.inventoryService
                .inventorySummaryGetItems({ tenentId: this.tenentId })
                .toPromise();

            if (response) {
                console.log('Received inventory summary data:', response);
                this.rowData = response;
            } else {
                console.error('Received null or undefined response from inventorySummaryGetItems');
                throw new Error('Failed to load inventory summary data');
            }
        } catch (error) {
            console.error('Error loading inventory summary data:', error);
            this.snackBar.open('Error loading inventory summary data', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        } finally {
            this.isLoading = false;
        }
    }

    back() {
        this.router.navigate(['/inventoryReport']);
    }

    async runEoqRopCalculation() {
        if (!this.tenentId) {
            this.snackBar.open('User information not loaded. Please try again.', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return;
        }

        this.isCalculating = true;
        try {
            const session = await fetchAuthSession();
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = {
                tenentId: this.tenentId,
            };

            const invokeCommand = new InvokeCommand({
                FunctionName: 'EOQ_ROP_Calculations',
                Payload: new TextEncoder().encode(JSON.stringify(payload)),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody && responseBody.statusCode === 200) {
                this.snackBar.open('EOQ/ROP/ABC Calculation completed successfully.', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
                // Refresh the data after calculation
                await this.loadInventorySummaryData();
            } else {
                throw new Error(responseBody?.body || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error running EOQ/ROP/ABC Calculation:', error);
            this.snackBar.open(
                `Error running calculation: ${error instanceof Error ? error.message : String(error)}`,
                'Close',
                {
                    duration: 5000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                },
            );
        } finally {
            this.isCalculating = false;
        }
    }
}
