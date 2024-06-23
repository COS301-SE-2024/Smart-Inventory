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

@Component({
    selector: 'app-suppliers',
    standalone: true,
    imports: [GridComponent, MatButtonModule, CommonModule, FormsModule],
    templateUrl: './suppliers.component.html',
    styleUrl: './suppliers.component.css',
})
export class SuppliersComponent implements OnInit {
    @ViewChild('gridComponent') gridComponent!: GridComponent;

    rowData: any[] = [];
    showAddPopup = false;
    showDeletePopup = false;
    rowsToDelete: any[] = [];
    supplier = {
        company_name: '',
        contact_name: '',
        contact_email: '',
        phone_number: '',
        address: {},
    };

    colDefs: ColDef[] = [
        { field: 'supplierID', headerName: 'Supplier ID', hide: true },
        { field: 'company_name', headerName: 'Company Name' },
        { field: 'contact_name', headerName: 'Contact Name' },
        { field: 'contact_email', headerName: 'Contact Email' },
        { field: 'phone_number', headerName: 'Phone Number' },
        { field: 'address', headerName: 'Address', valueGetter: (params: any) => this.getAddressString(params.data.address) },
    ];

    addButton = { text: 'Add New Supplier' };

    constructor(private titleService: TitleService) {
        Amplify.configure(outputs);
    }

    async ngOnInit(): Promise<void> {
        this.titleService.updateTitle('Suppliers');
        await this.loadSuppliersData();
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

            const tenantId = getUserResponse.UserAttributes?.find(
                (attr) => attr.Name === 'custom:tenentId'
            )?.Value;

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
        }
    }

    getAddressString(address: any): string {
        return `${address.street}, ${address.city}, ${address.country}, ${address.postal_code}`;
    }

    openAddSupplierPopup() {
        this.showAddPopup = true;
    }

    closeAddPopup() {
        this.showAddPopup = false;
        this.supplier = {
            company_name: '',
            contact_name: '',
            contact_email: '',
            phone_number: '',
            address: {},
        };
    }

    async onSubmit(formData: any) {
        // Implement the logic to submit the new supplier data
        // You can use the formData object to access the form values
        // and make an API call or invoke a lambda function to add the supplier
        // After successful submission, reload the suppliers data
        // this.loadSuppliersData();
        // Close the add popup
        // this.closeAddPopup();
    }

    handleRowsToDelete(rows: any[]) {
        this.rowsToDelete = rows;
        this.showDeletePopup = true;
    }

    async confirmDelete() {
        // Implement the logic to delete the selected suppliers
        // You can iterate over the rowsToDelete array and make API calls
        // or invoke lambda functions to delete each supplier
        // After successful deletion, reload the suppliers data
        // this.loadSuppliersData();
        // Close the delete popup
        // this.showDeletePopup = false;
        // Clear the rowsToDelete array
        // this.rowsToDelete = [];
    }

    cancelDelete() {
        this.showDeletePopup = false;
        this.rowsToDelete = [];
    }

    async handleCellValueChanged(event: { data: any; field: string; newValue: any }) {
        // Implement the logic to update the supplier data when a cell value is changed
        // You can use the event object to access the updated data and field
        // and make an API call or invoke a lambda function to update the supplier
        // After successful update, you can update the local rowData to reflect the changes
    }
}