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
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'app/components/material/material.module';
@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [
        GridComponent,
        // MatButtonModule,
        CommonModule,
        FormsModule,
        DeleteConfirmationDialogComponent,
        LoadingSpinnerComponent,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        // MatFormFieldModule,
        MaterialModule,
    ],
    templateUrl: './suppliers.component.html',
    styleUrl: './suppliers.component.css',
})
export class SuppliersComponent implements OnInit {
    @ViewChild('gridComponent') gridComponent!: GridComponent;

    rowData: any[] = [];
    showAddPopup = false;
    showDeletePopup = false;
    isLoading = true;
    rowsToDelete: any[] = [];
    showEditAddressPopup = false;
    tenantId: string = '';
    userName: string = '';
    userRole: string = '';
    editAddress = {
        street: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: '',
    };
    selectedSupplier: any;
    supplier = {
        company_name: '',
        contact_name: '',
        contact_email: '',
        phone_number: '',
        address: {
            street: '',
            city: '',
            state_province: '',
            postal_code: '',
            country: '',
        },
    };

    colDefs: ColDef[] = [
        { field: 'supplierID', headerName: 'Supplier ID', hide: true },
        { field: 'company_name', headerName: 'Company Name', filter: 'agSetColumnFilter' },
        { field: 'contact_name', headerName: 'Contact Name', filter: 'agSetColumnFilter', editable: true },
        { field: 'contact_email', headerName: 'Contact Email', filter: 'agSetColumnFilter', editable: true },
        { field: 'phone_number', headerName: 'Phone Number', filter: 'agSetColumnFilter', editable: true },
        {
            field: 'address',
            headerName: 'Address',
            filter: 'agSetColumnFilter',
            valueGetter: (params: any) => this.getAddressString(params.data.address),
            onCellClicked: (params: any) => this.onAddressCellClicked(params.data),
        },
    ];

    addButton = { text: 'Add New Supplier' };

    constructor(
        private titleService: TitleService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {
        Amplify.configure(outputs);
    }

    async ngOnInit(): Promise<void> {
        this.titleService.updateTitle('Suppliers');
        await this.getUserInfo();
        await this.loadSuppliersData();
        await this.logActivity('Viewed suppliers', 'Suppliers page navigated');
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
                memberId: this.tenantId,
                name: this.userName,
                role: this.userRole || 'Admin',
                task: task,
                timeSpent: 0,
                idleTime: 0,
                details: details,
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
                this.rowData = suppliers.map((supplier: any) => ({
                    supplierID: supplier.supplierID,
                    company_name: supplier.company_name,
                    contact_name: supplier.contact_name,
                    contact_email: supplier.contact_email,
                    phone_number: supplier.phone_number,
                    address: supplier.address,
                }));
                console.log('Processed suppliers:', this.rowData);
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

    getAddressString(address: any): string {
        return `${address.street}, ${address.city}, ${address.country}, ${address.postal_code}`;
    }

    async openAddSupplierPopup() {
        this.showAddPopup = true;
        await this.logActivity('Opened add supplier popup', 'Initiated adding a new supplier');
    }

    async onAddressCellClicked(supplier: any) {
        this.openEditAddressPopup(supplier);
        await this.logActivity('Opened edit address popup', `Editing address for supplier ${supplier.company_name}`);
    }

    closeAddPopup() {
        this.showAddPopup = false;
        this.supplier = {
            company_name: '',
            contact_name: '',
            contact_email: '',
            phone_number: '',
            address: {
                street: '',
                city: '',
                state_province: '',
                postal_code: '',
                country: '',
            },
        };
    }

    openEditAddressPopup(supplier: any) {
        this.selectedSupplier = supplier;
        this.editAddress = { ...supplier.address };
        this.showEditAddressPopup = true;
    }

    closeEditAddressPopup() {
        this.showEditAddressPopup = false;
        this.selectedSupplier = null;
        this.editAddress = {
            street: '',
            city: '',
            state_province: '',
            postal_code: '',
            country: '',
        };
    }

    async onEditAddressSubmit(formData: any) {
        try {
            console.log('Updated address:', formData);

            const session = await fetchAuthSession();

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

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const updatedData = {
                supplierID: this.selectedSupplier.supplierID,
                tenentId: tenentId,
                address: formData,
            };

            console.log('Updated data:', updatedData);

            const invokeCommand = new InvokeCommand({
                FunctionName: 'editSupplier',
                Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(updatedData) })),
            });

            console.log('Invoking editSupplier lambda function');

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            console.log('Lambda response:', responseBody);

            if (responseBody.statusCode === 200) {
                console.log('Supplier address updated successfully');
                const updatedSupplier = JSON.parse(responseBody.body);

                await this.logActivity(
                    'Updated supplier address',
                    `Updated address for supplier ${this.selectedSupplier.company_name}`,
                );
                this.closeEditAddressPopup();
                this.loadSuppliersData();
                this.snackBar.open('Supplier address updated successfully', 'Close', {
                    duration: 6000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                  });
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error updating supplier address:', error);
            alert(`Error updating supplier address: ${(error as Error).message}`);
        }
    }

    async onSubmit(formData: any) {
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
                throw new Error('TenantId not found in user attributes');
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = {
                company_name: formData.company_name,
                contact_name: formData.contact_name,
                contact_email: formData.contact_email,
                phone_number: formData.phone_number,
                address: {
                    street: formData.street,
                    city: formData.city,
                    state_province: formData.state_province,
                    postal_code: formData.postal_code,
                    country: formData.country,
                },
                tenentId: tenantId,
            };

            console.log(payload);

            const invokeCommand = new InvokeCommand({
                FunctionName: 'addSupplier',
                Payload: new TextEncoder().encode(JSON.stringify(payload)),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 201) {
                console.log('Supplier added successfully');
                await this.loadSuppliersData();
                this.closeAddPopup();
                this.snackBar.open('Supplier added successfully', 'Close', {
                    duration: 6000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
                await this.logActivity('Added new supplier', `Added supplier ${formData.company_name}`);
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    handleRowsToDelete(rows: any[]) {
        this.rowsToDelete = rows;
        this.openDeleteConfirmationDialog();
    }

    openDeleteConfirmationDialog() {
        if (this.rowsToDelete.length > 0) {
            const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
                width: '350px',
                data: {
                    company_name: this.rowsToDelete[0].company_name,
                    contact_email: this.rowsToDelete[0].contact_email,
                },
            });

            dialogRef.componentInstance.deleteConfirmed.subscribe(() => {
                this.confirmDelete();
                dialogRef.close();
            });
        }
    }

    async confirmDelete() {
        if (this.rowsToDelete.length > 0) {
            for (const row of this.rowsToDelete) {
                await this.deleteSupplier(row.supplierID);
            }
            this.gridComponent.removeConfirmedRows(this.rowsToDelete);
            this.rowsToDelete = [];
            await this.loadSuppliersData(); // Refresh the data after deletion
        }
    }

    async deleteSupplier(supplierID: string) {
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
                throw new Error('TenantId not found in user attributes');
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                supplierID: supplierID,
                tenentId: tenantId,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'deleteSupplier',
                Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                console.log('Supplier deleted successfully');
                this.snackBar.open('Supplier deleted successfully', 'Close', {
                    duration: 6000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert(`Error deleting supplier: ${(error as Error).message}`);
        }
    }

    cancelDelete() {
        this.showDeletePopup = false;
        this.rowsToDelete = [];
    }

    async handleCellValueChanged(event: { data: any; field: string; newValue: any }) {
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

            const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

            if (!tenentId) {
                throw new Error('TenentId not found in user attributes');
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const updatedData = {
                supplierID: event.data.supplierID,
                tenentId: tenentId,
                [event.field]: event.newValue,
            };

            const invokeCommand = new InvokeCommand({
                FunctionName: 'editSupplier',
                Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(updatedData) })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                console.log('Supplier updated successfully');
                // Update the local data to reflect the change
                const updatedSupplier = JSON.parse(responseBody.body);
                const index = this.rowData.findIndex((supplier) => supplier.supplierID === updatedSupplier.supplierID);
                if (index !== -1) {
                    this.rowData[index] = { ...this.rowData[index], ...updatedSupplier };
                }
                this.snackBar.open('Supplier updated successfully', 'Close', {
                    duration: 6000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                  });
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error updating supplier:', error);
            alert(`Error updating supplier: ${(error as Error).message}`);
            // Revert the change in the grid
            this.gridComponent.updateRow(event.data);
        }
    }
}
