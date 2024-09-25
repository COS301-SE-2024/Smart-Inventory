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
import outputs from '../../../../amplify_outputs.json';
import { TitleService } from 'app/components/header/title.service';
import { MaterialModule } from '../../components/material/material.module';
import { Router } from '@angular/router';
import { InventoryService } from '../../../../amplify/services/inventory.service';
import { interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    private calculationSubscription: Subscription | null = null;

    colDefs: ColDef[] = [
        { field: 'SKU', headerName: 'SKU', filter: 'agSetColumnFilter' },
        { field: 'description', headerName: 'Description', filter: 'agSetColumnFilter', editable: true },
        {
            field: 'quantity',
            headerName: 'Quantity',
            filter: 'agSetColumnFilter',
            cellStyle: (params) => {
                if (params.value <= params.data.lowStockThreshold) {
                    return { backgroundColor: '#FFCDD2' }; // Light red for low stock
                } else {
                    return { backgroundColor: '#E8F5E9' }; // Light green for normal stock
                }
            },
        },
        { field: 'lowStockThreshold', headerName: 'Low Stock Threshold', filter: 'agSetColumnFilter', editable: true },
        { field: 'reorderAmount', headerName: 'Reorder Amount', filter: 'agSetColumnFilter', editable: true },
        { field: 'EOQ', headerName: 'EOQ', filter: 'agSetColumnFilter' },
        { field: 'ROP', headerName: 'ROP', filter: 'agSetColumnFilter' },
        { field: 'safetyStock', headerName: 'Safety Stock', filter: 'agSetColumnFilter' },
        { field: 'ABCCategory', headerName: 'ABC Category', filter: 'agSetColumnFilter' },
        { field: 'annualConsumptionValue', headerName: 'Annual Consumption Value', filter: 'agSetColumnFilter' },
        { field: 'holdingCost', headerName: 'Holding Cost', filter: 'agSetColumnFilter' },
        { field: 'annualDemand', headerName: 'Annual Demand', filter: 'agSetColumnFilter' },
        { field: 'dailyDemand', headerName: 'Daily Demand', filter: 'agSetColumnFilter' },
    ];

    constructor(
        private snackBar: MatSnackBar,
        private titleService: TitleService,
        private router: Router,
        private inventoryService: InventoryService
    ) {
        Amplify.configure(outputs);
    }

    // EOQ, ROP, ABC
    runEoqRopCalculation() {
        if (this.isCalculating) {
            this.snackBar.open('Calculation is already in progress', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return;
        }

        this.isCalculating = true;
        this.snackBar.open('EOQ/ROP calculation started', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });

        this.calculationSubscription = this.inventoryService.runEoqRopCalculation(this.tenentId)
            .subscribe({
                next: (response) => {
                    console.log('EOQ/ROP calculation response:', response);
                    this.snackBar.open('EOQ/ROP calculation completed successfully', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top',
                    });
                    this.loadInventorySummaryData();
                },
                error: (error) => {
                    console.error('Error running EOQ/ROP calculation:', error);
                    this.snackBar.open('Error running EOQ/ROP calculation', 'Close', {
                        duration: 3000,
                        horizontalPosition: 'center',
                        verticalPosition: 'top',
                    });
                },
                complete: () => {
                    this.isCalculating = false;
                    this.calculationSubscription = null;
                }
            });
    }

    async ngOnInit(): Promise<void> {
        this.titleService.updateTitle('Inventory Summary');
        try {
            const session = await fetchAuthSession();
            this.tenentId = await this.getTenentId(session);
            await this.loadInventorySummaryData();
        } catch (error) {
            console.error('Error initializing component:', error);
            this.snackBar.open('Error initializing component', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    ngOnDestroy(): void {
        if (this.calculationSubscription) {
            this.calculationSubscription.unsubscribe();
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
            const response = await this.inventoryService.inventorySummaryGetItems({ tenentId: this.tenentId }).toPromise();
    
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
        this.router.navigate(['/inventory']);
    }
}
