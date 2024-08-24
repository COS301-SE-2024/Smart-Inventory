import { Component, OnInit, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../components/header/title.service';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';
import { MatDialog } from '@angular/material/dialog';
import { InventoryDeleteConfirmationDialogComponent } from './inventory-delete-confirmation-dialogue.component';
import { MatDialogModule } from '@angular/material/dialog';
import { AddInventoryModalComponent } from './add-inventory-modal/add-inventory-modal.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { RequestStockModalComponent } from './request-stock-modal/request-stock-modal.component';
import { MatNativeDateModule } from '@angular/material/core';

import { timestamp } from 'rxjs';

import {
    MatSnackBar,
    MatSnackBarAction,
    MatSnackBarActions,
    MatSnackBarLabel,
    MatSnackBarRef,
} from '@angular/material/snack-bar';
@Component({
    selector: 'app-inventory',
    standalone: true,
    imports: [
        GridComponent,
        MatButtonModule,
        CommonModule,
        FormsModule,
        LoadingSpinnerComponent,
        MatDialogModule,
        InventoryDeleteConfirmationDialogComponent,
        AddInventoryModalComponent,
        RequestStockModalComponent,
        MatNativeDateModule,
        MatDatepickerModule,
    ],
    templateUrl: './inventory.component.html',
    styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit {
    @ViewChild('gridComponent') gridComponent!: GridComponent;

    rowData: any[] = [];
    isLoading = true;
    suppliers: any[] = [];
    userName: string = '';
    userRole: string = '';
    tenantId: string = '';

    colDefs: ColDef[] = [
        { field: 'inventoryID', headerName: 'Inventory ID', hide: true },
        { field: 'sku', headerName: 'SKU', filter: 'agSetColumnFilter' },
        { field: 'upc', headerName: 'Universal Product Code', filter: 'agSetColumnFilter' },
        { field: 'description', headerName: 'Description', filter: 'agSetColumnFilter' },
        { field: 'category', headerName: 'Category', filter: 'agSetColumnFilter' },
        { field: 'quantity', headerName: 'Quantity', filter: 'agSetColumnFilter' },
        { field: 'supplier', headerName: 'Supplier', filter: 'agSetColumnFilter' },
        {
            field: 'expirationDate',
            headerName: 'Expiration Date',
            filter: 'agSetColumnFilter',
            valueFormatter: (params) => {
                if (params.value) {
                    const date = new Date(params.value);
                    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                }
                return '';
            },
        },
        { field: 'unitCost', headerName: 'Unit Cost', filter: 'agSetColumnFilter' },
        { field: 'lowStockThreshold', headerName: 'Low Stock Threshold', filter: 'agSetColumnFilter' },
        { field: 'reorderAmount', headerName: 'Reorder Amount', filter: 'agSetColumnFilter' },
    ];

    addButton = { text: 'Add New Item' };

    constructor(
        private titleService: TitleService,
        private dialog: MatDialog,
    ) {
        Amplify.configure(outputs);
    }

    async ngOnInit(): Promise<void> {
        this.titleService.updateTitle('Inventory');
        await this.getUserInfo();
        await this.loadInventoryData();
        await this.loadSuppliers();
    }

    async getUserInfo() {
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

            const givenName = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'given_name')?.Value || '';
            const familyName = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'family_name')?.Value || '';
            this.userName = `${givenName} ${familyName}`.trim();

            this.tenantId =
                getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value || '';

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                userPoolId: outputs.auth.user_pool_id,
                username: session.tokens?.accessToken.payload['username'],
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getUsersV2',
                Payload: new TextEncoder().encode(payload),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const users = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            const currentUser = users.find(
                (user: any) =>
                    user.Attributes.find((attr: any) => attr.Name === 'email')?.Value ===
                    session.tokens?.accessToken.payload['username'],
            );

            if (currentUser && currentUser.Groups.length > 0) {
                this.userRole = this.getRoleDisplayName(currentUser.Groups[0].GroupName);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    }

    private getRoleDisplayName(roleName: string): string {
        switch (roleName) {
            case 'admin':
                return 'Admin';
            case 'enduser':
                return 'End User';
            case 'inventorycontroller':
                return 'Inventory Controller';
            default:
                return '';
        }
    }

    async loadInventoryData() {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'Inventory-getItems',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: this.tenantId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const inventoryItems = JSON.parse(responseBody.body);
                this.rowData = inventoryItems.map((item: any) => ({
                    inventoryID: item.inventoryID,
                    sku: item.SKU,
                    category: item.category,
                    upc: item.upc,
                    description: item.description,
                    quantity: item.quantity,
                    supplier: item.supplier,
                    expirationDate: item.expirationDate,
                    lowStockThreshold: item.lowStockThreshold,
                    reorderAmount: item.reorderAmount,
                    unitCost: item.unitCost,
                }));
                console.log('Processed inventory items:', this.rowData);

                await this.logActivity('Viewed inventory', 'Inventory navigated');
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

    async loadSuppliers() {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getSuppliers',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: this.tenantId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                this.suppliers = JSON.parse(responseBody.body);
            } else {
                console.error('Error fetching suppliers data:', responseBody.body);
                this.suppliers = [];
            }
        } catch (error) {
            console.error('Error in loadSuppliers:', error);
            this.suppliers = [];
        }
    }

    openAddItemPopup() {
        const dialogRef = this.dialog.open(AddInventoryModalComponent, {
            width: '600px',
            data: { suppliers: this.suppliers },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.onSubmit(result);
            }
        });
    }

    async onSubmit(formData: any) {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                upc: formData.upc,
                description: formData.description,
                category: formData.category,
                quantity: formData.quantity,
                sku: formData.sku,
                supplier: formData.supplier,
                tenentId: this.tenantId,
                expirationDate: formData.expirationDate,
                lowStockThreshold: formData.lowStockThreshold,
                reorderAmount: formData.reorderAmount,
            });

            console.log('Payload:', payload);

            const invokeCommand = new InvokeCommand({
                FunctionName: 'Inventory-CreateItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 201) {
                console.log('Inventory item added successfully');
                await this.logActivity('Added new inventory item', formData.upc + ' was added.');
                await this.loadInventoryData();
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error:', (error as Error).message);
            alert(`Error: ${(error as Error).message}`);
        }
    }

    handleRowsToDelete(rows: any[]) {
        if (rows.length > 0) {
            const dialogRef = this.dialog.open(InventoryDeleteConfirmationDialogComponent, {
                width: '300px',
                data: { sku: rows[0].sku },
            });

            dialogRef.componentInstance.deleteConfirmed.subscribe(async () => {
                for (const row of rows) {
                    await this.deleteInventoryItem(row.inventoryID);
                }
                this.gridComponent.removeConfirmedRows(rows);
                await this.loadInventoryData();
            });
        }
    }

    async deleteInventoryItem(inventoryID: string) {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                inventoryID: inventoryID,
                tenentId: this.tenantId,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'Inventory-removeItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                console.log('Inventory item deleted successfully');
                await this.logActivity('Deleted inventory item', inventoryID + ' was deleted.');
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            alert(`Error deleting inventory item: ${(error as Error).message}`);
        }
    }

    async handleCellValueChanged(event: { data: any; field: string; newValue: any }) {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const updatedData = {
                inventoryID: event.data.inventoryID,
                tenentId: this.tenantId,
                [event.field]: event.newValue,
            };

            const invokeCommand = new InvokeCommand({
                FunctionName: 'Inventory-updateItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(updatedData) })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                console.log('Inventory item updated successfully');
                await this.logActivity('Updated inventory item', event.data.upc + ' was updated.');
                // Update the local data to reflect the change
                const updatedItem = JSON.parse(responseBody.body);
                const index = this.rowData.findIndex((item) => item.inventoryID === updatedItem.inventoryID);
                if (index !== -1) {
                    this.rowData[index] = { ...this.rowData[index], ...updatedItem };
                }
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error updating inventory item:', error);
            alert(`Error updating inventory item: ${(error as Error).message}`);
            // Revert the change in the grid
            this.gridComponent.updateRow(event.data);
        }
    }

    openRequestStockPopup(item: any) {
        const dialogRef = this.dialog.open(RequestStockModalComponent, {
            width: '400px',
            data: { sku: item.sku, supplier: item.supplier },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.requestStock(item, result);
            }
        });
    }

    async requestStock(item: any, quantity: number) {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            // First, update the inventory
            const updatedQuantity = item.quantity - quantity;
            const updateEvent = {
                data: item,
                field: 'quantity',
                newValue: updatedQuantity,
            };
            await this.handleCellValueChanged(updateEvent);

            // Then, create the stock request report
            const reportPayload = {
                tenentId: this.tenantId,
                sku: item.sku,
                category: item.category,
                supplier: item.supplier,
                quantityRequested: quantity.toString(),
            };

            console.log('Report Payload:', reportPayload);

            const createReportCommand = new InvokeCommand({
                FunctionName: 'Report-createItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(reportPayload) })),
            });

            const lambdaResponse = await lambdaClient.send(createReportCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            console.log('Lambda Response:', responseBody);

            if (responseBody.statusCode === 201) {
                console.log('Stock request report created successfully');
                await this.logActivity('Requested stock', quantity.toString() + 'of ' + item.sku);
                await this.loadInventoryData();
            } else {
                throw new Error(JSON.stringify(responseBody.body));
            }
        } catch (error) {
            console.error('Error requesting stock:', error);
            alert(`Error requesting stock: ${(error as Error).message}`);
        }
    }

    async logActivity(task: string, details: string) {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                tenentId: this.tenantId,
                memberId: this.tenantId, // Assuming memberId is the same as tenantId
                name: this.userName,
                role: this.userRole || 'Admin',
                task: task,
                timeSpent: 0, // You might want to calculate this
                idleTime: 0, // You might want to calculate this
                details: details, // This will not be stored in DynamoDB as per the Lambda function
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'userActivity-createItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 201) {
                console.log('Activity logged successfully');
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }
}
