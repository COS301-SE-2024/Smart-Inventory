import { Component, OnInit, ViewChild } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../components/header/title.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Amplify } from 'aws-amplify';
import { CustomQuoteModalComponent } from '../../components/custom-quote-modal/custom-quote-modal.component';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailTemplateModalComponent } from '../../components/email-template-modal/email-template-modal.component';
import { DeliveryInformationModalComponent } from '../../components/delivery-information-modal/delivery-information-modal.component';
import { ReceivedQuotesSidePaneComponent } from 'app/components/received-quotes-side-pane/received-quotes-side-pane.component';
import { TemplatesQuotesSidePaneComponent } from 'app/components/templates-quotes-side-pane/templates-quotes-side-pane.component';
import { MatCardModule } from '@angular/material/card';
import { ReceiveOrderModalComponent } from 'app/components/receive-order-modal/receive-order-modal.component';
import { AutomationSettingsModalComponent } from 'app/components/automation-settings-modal/automation-settings-modal.component';
import { OrdersService } from '../../../../amplify/services/orders.service';

interface DeliveryAddress {
    company: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    instructions: string;
    contactName: string;
    email: string;
    phone: string;
}
const defaultColor = '#FFF0DB'; // Orange/yellow color
const completedColor = '#E8F5E9'; // Green color
const sentToSuppliersColor = '#E3F2FD'; // Light blue color
const pendingApprovalColor = '#FFCDD2'; // Light red color for Pending Approval

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        GridComponent,
        MatButtonModule,
        MatDialogModule,
        CommonModule,
        LoadingSpinnerComponent,
        ReceivedQuotesSidePaneComponent,
        MatCardModule,
        TemplatesQuotesSidePaneComponent,
    ],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
    @ViewChild(GridComponent) gridComponent!: GridComponent;

    isLoading = true;
    isSidePaneOpen: boolean = false;
    isTemplateSidePaneOpen: boolean = false;

    constructor(
        private titleService: TitleService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private ordersService: OrdersService
    ) {
        Amplify.configure(outputs);
    }

    rowData: any[] = [];
    selectedOrder: any = null;

    // Column Definitions: Defines & controls grid columns.
    colDefs: ColDef[] = [
        { field: 'Order_ID', headerName: 'Order ID', filter: 'agSetColumnFilter' },
        { field: 'Order_Date', headerName: 'Order Date', filter: 'agDateColumnFilter' },
        {
            field: 'Creation_Time',
            headerName: 'Creation Time',
            filter: 'agTextColumnFilter',
            valueFormatter: (params) => {
                if (params.value) {
                    const date = new Date(params.value);
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                }
                return '';
            },
        },
        {
            field: 'Order_Status',
            headerName: 'Order Status',
            filter: 'agSetColumnFilter',
            cellStyle: (params) => {
                if (params.value === 'Pending Approval') {
                    return { backgroundColor: pendingApprovalColor };
                } else if (params.value === 'Completed') {
                    return { backgroundColor: completedColor };
                } else {
                    return { backgroundColor: defaultColor };
                }
            },
        },
        { field: 'Quote_ID', headerName: 'Quote ID', filter: 'agSetColumnFilter' },
        {
            field: 'Quote_Status',
            headerName: 'Quote Status',
            filter: 'agSetColumnFilter',
            cellStyle: (params) => {
                if (params.value === 'Sent to Suppliers') {
                    return { backgroundColor: sentToSuppliersColor };
                } else if (params.value === 'Accepted') {
                    return { backgroundColor: completedColor };
                } else if (params.value === 'Renegotiation Requested') {
                    return { backgroundColor: sentToSuppliersColor };
                } else {
                    return { backgroundColor: pendingApprovalColor };
                }
            },
        },
        { field: 'Selected_Supplier', headerName: 'Selected Supplier', filter: 'agSetColumnFilter' },
        {
            field: 'Date_Accepted',
            headerName: 'Date Accepted',
            filter: 'agDateColumnFilter',
        },
        {
            field: 'Lead_Time',
            headerName: 'Lead Time (Days)',
            filter: 'agNumberColumnFilter',
        },
        { field: 'Expected_Delivery_Date', headerName: 'Expected Delivery Date', filter: 'agDateColumnFilter' },
        { field: 'Actual_Delivery_Date', headerName: 'Actual Delivery Date', filter: 'agDateColumnFilter' },
        {
            field: 'Submission_Deadline',
            headerName: 'Submission Deadline',
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => {
                if (params.value) {
                    const date = new Date(params.value);
                    return date.toLocaleDateString();
                }
                return '';
            },
        },
    ];

    deliveryAddress: DeliveryAddress = {
        company: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        instructions: '',
        contactName: '',
        email: '',
        phone: '',
    };

    defaultColDef: ColDef = {
        flex: 1,
        editable: true,
    };

    openAddDialog() {}

    async ngOnInit() {
        this.titleService.updateTitle('Orders');
        await this.loadOrdersData();
    }

    onRowSelected(row: any) {
        if (row) {
            this.selectedOrder = row;
            console.log('Selected order:', this.selectedOrder);
        } else {
            this.selectedOrder = null;
            console.log('No order selected');
        }
    }

    async viewGeneratedQuote() {
        console.log('Current selected order:', this.selectedOrder);
        if (!this.selectedOrder) {
            alert('Please select an order first');
            return;
        }
        try {
            const quoteDetails = await this.fetchQuoteDetails(this.selectedOrder.Quote_ID);
            this.openCustomQuoteModal(
                quoteDetails,
                this.selectedOrder.Order_ID,
                this.selectedOrder.Quote_ID,
                this.selectedOrder.Submission_Deadline,
                this.selectedOrder.Order_Date,
            );
        } catch (error) {
            console.error('Error fetching quote details:', error);
            alert('Error fetching quote details');
        }
    }

    viewTemplatesQuotes() {
        this.isTemplateSidePaneOpen = true;
    }

    openCustomQuoteModal(
        quoteDetails: any,
        orderId: string,
        quoteId: string,
        submissionDeadline: string,
        orderDate: string,
    ) {
        const dialogRef = this.dialog.open(CustomQuoteModalComponent, {
            width: '600px',
            maxWidth: '600px',
            data: {
                quoteDetails: {
                    ...quoteDetails,
                    orderId: orderId,
                    quoteId: quoteId,
                    Submission_Deadline: submissionDeadline,
                    orderDate: orderDate, // Add this line
                },
                isEditing: false,
                isNewQuote: !orderId,
            },
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.action === 'saveChanges') {
                this.updateQuote(result.data);
            } else if (result && result.action === 'sendQuote') {
                this.sendQuote(result.data);
            }
        });
    }

    async fetchQuoteDetails(quoteId: string) {
        try {
            const session = await fetchAuthSession();
            const tenentId = await this.getTenentId(session);
    
            const quoteDetails = await this.ordersService.getQuoteDetails(tenentId, quoteId).toPromise();
    
            return quoteDetails;
        } catch (error) {
            console.error('Error fetching quote details:', error);
            throw error;
        }
    }

    async updateQuote(updatedQuote: any) {
        try {
            const session = await fetchAuthSession();
            const tenentId = await this.getTenentId(session);
    
            if (!updatedQuote.quoteId) {
                throw new Error('Quote ID is missing');
            }
    
            const payload = {
                items: updatedQuote.items.map((item: any) => ({
                    ItemSKU: item.ItemSKU,
                    Quantity: item.Quantity,
                })),
                suppliers: updatedQuote.suppliers.map((supplier: any) => ({
                    company_name: supplier.company_name,
                    supplierID: supplier.supplierID,
                })),
                orderId: updatedQuote.orderId,
                orderDate: updatedQuote.orderDate,
                Submission_Deadline: updatedQuote.Submission_Deadline
            };
    
            console.log('Updating quote with payload:', JSON.stringify(payload, null, 2));
    
            const response = await this.ordersService.updateQuoteDetails(tenentId, updatedQuote.quoteId, payload).toPromise();
    
            console.log('API response:', JSON.stringify(response, null, 2));
    
            if (response && response.message === 'Quote updated successfully') {
                console.log('Quote updated successfully');
    
                // Show success snackbar
                this.snackBar.open('Changes saved successfully', 'Close', {
                    duration: 6000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
    
                // Refresh the orders data
                await this.loadOrdersData();
            } else {
                throw new Error(response.error || 'Failed to update quote');
            }
        } catch (error) {
            console.error('Error updating quote:', error);
    
            // Show error snackbar
            this.snackBar.open(`Error saving changes: ${(error as Error).message}`, 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    async createNewOrder(quoteData: any) {
        try {
            const session = await fetchAuthSession();
            const tenentId = await this.getTenentId(session);
    
            const orderDate = new Date().toISOString().split('T')[0];
    
            const newOrder = {
                Order_Date: orderDate,
                Order_Status: 'Pending Approval',
                Quote_Status: quoteData.Quote_Status || 'Draft',
                Selected_Supplier: null,
                Expected_Delivery_Date: null,
                Actual_Delivery_Date: null,
                tenentId: tenentId,
                Creation_Time: new Date().toISOString(),
                Submission_Deadline: quoteData.Submission_Deadline,
                quoteItems: quoteData.items.map((item: any) => ({
                    ItemSKU: item.ItemSKU,
                    Quantity: item.Quantity,
                    inventoryID: item.inventoryID,
                })),
                suppliers: quoteData.suppliers.map((supplier: any) => ({
                    company_name: supplier.company_name,
                    supplierID: supplier.supplierID,
                })),
            };
    
            console.log('New Quote Data:', quoteData);
            console.log('New Order Data:', newOrder);
    
            const response = await this.ordersService.createOrder(newOrder).toPromise();
    
            console.log('API response:', response);
    
            if (response && response.orderId && response.quoteId) {
                console.log('Order created successfully');
    
                this.snackBar.open('Order created successfully', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
    
                console.log('Created order ID:', response.orderId);
                console.log('Created quote ID:', response.quoteId);
    
                await this.loadOrdersData();
    
                const quoteDetails = {
                    orderId: response.orderId,
                    quoteId: response.quoteId,
                    items: quoteData.items,
                    suppliers: quoteData.suppliers,
                    Submission_Deadline: quoteData.Submission_Deadline,
                    orderDate: orderDate,
                };
    
                setTimeout(() => {
                    this.openCustomQuoteModal(quoteDetails, response.orderId, response.quoteId, quoteData.Submission_Deadline, orderDate);
                }, 3000);
            } else {
                throw new Error('Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
    
            this.snackBar.open(`Error creating order: ${(error as Error).message}`, 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    async handleNewCustomQuote(event: { type: string; data: any }) {
        if (event.type === 'order') {
            await this.createNewOrder({
                ...event.data,
                Submission_Deadline: event.data.Submission_Deadline,
            });
        }
        if (event.type === 'draft') {
            await this.createNewOrder({
                ...event.data,
                Quote_Status: 'Draft',
                Submission_Deadline: event.data.Submission_Deadline,
            });
        } else if (event.type === 'quote') {
            await this.createNewOrder({
                ...event.data,
                Quote_Status: 'Sent',
                Submission_Deadline: event.data.Submission_Deadline,
            });
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

    async loadOrdersData() {
        this.isLoading = true;
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
                console.error('TenentId not found in user attributes');
                this.rowData = [];
                return;
            }
    
            const orders = await this.ordersService.getOrders(tenentId).toPromise();
    
            if (orders) {
                this.rowData = orders.map((order: any) => ({
                    Order_ID: order.Order_ID,
                    Order_Date: order.Order_Date,
                    Order_Status: order.Order_Status,
                    Quote_ID: order.Quote_ID,
                    Quote_Status: order.Quote_Status,
                    Selected_Supplier: order.Selected_Supplier,
                    Expected_Delivery_Date: order.Expected_Delivery_Date,
                    Actual_Delivery_Date: order.Actual_Delivery_Date,
                    Creation_Time: order.Creation_Time,
                    Date_Accepted: order.Date_Accepted,
                    Lead_Time: order.Lead_Time,
                    Submission_Deadline: order.Submission_Deadline,
                }));
                console.log('Processed orders:', this.rowData);
            } else {
                console.error('Error fetching orders data');
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
        }
    }

    refreshGridSelection() {
        if (this.gridComponent && this.gridComponent.gridApi) {
            const selectedRows = this.gridComponent.gridApi.getSelectedRows();
            if (selectedRows.length > 0) {
                this.selectedOrder = selectedRows[0];
                console.log('Refreshed selected order:', this.selectedOrder);
            } else {
                this.selectedOrder = null;
                console.log('No order selected after refresh');
            }
        }
    }

    async deleteOrderRow() {
        if (!this.selectedOrder) {
            alert('Please select an order to delete');
            return;
        }

        if (this.selectedOrder.Quote_Status !== 'Draft') {
            this.snackBar.open('Only orders in draft status can be deleted', 'Close', {
                duration: 6000, // Duration in milliseconds
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return;
        }

        if (confirm('Are you sure you want to delete this order?')) {
            try {
                const session = await fetchAuthSession();
                const tenentId = await this.getTenentId(session);

                const lambdaClient = new LambdaClient({
                    region: outputs.auth.aws_region,
                    credentials: session.credentials,
                });

                const invokeCommand = new InvokeCommand({
                    FunctionName: 'deleteOrder',
                    Payload: new TextEncoder().encode(
                        JSON.stringify({
                            pathParameters: {
                                tenentId: tenentId,
                                orderId: this.selectedOrder.Order_ID,
                                quoteId: this.selectedOrder.Quote_ID,
                            },
                        }),
                    ),
                });

                const lambdaResponse = await lambdaClient.send(invokeCommand);
                const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

                if (responseBody.statusCode === 200) {
                    console.log('Order deleted successfully');

                    // Show success snackbar
                    this.snackBar.open('Order deleted successfully', 'Close', {
                        duration: 6000, // Duration in milliseconds
                        horizontalPosition: 'center',
                        verticalPosition: 'top',
                    });

                    await this.loadOrdersData();
                    this.selectedOrder = null;
                    this.refreshGridSelection();
                } else {
                    throw new Error(responseBody.body || 'Unknown error occurred');
                }
            } catch (error) {
                console.error('Error deleting order:', error);

                // Show error snackbar
                this.snackBar.open(`Error deleting order: ${(error as Error).message}`, 'Close', {
                    duration: 5000, // Longer duration for error messages
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            }
        }
    }

    async sendQuote(quoteData: any) {
        try {
            // Log the email data
            console.log('Email data for sending quote:', quoteData.emailData);

            // Implement the logic to send the quote
            console.log('Sending quote:', quoteData);

            // Show success snackbar
            this.snackBar.open('Quote sent successfully', 'Close', {
                duration: 6000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });

            // Reload the orders data
            await this.loadOrdersData();
        } catch (error) {
            console.error('Error sending quote:', error);

            // Show error snackbar
            this.snackBar.open(`Error sending quote: ${(error as Error).message}`, 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    viewEmailTemplate() {
        const dialogRef = this.dialog.open(EmailTemplateModalComponent, {
            width: '600px',
            data: { emailTemplate: this.getEmailTemplate() },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.saveEmailTemplate(result);
            }
        });
    }

    getEmailTemplate() {
        // Implement logic to get the current email template
        // This could be from a service or local storage
        return {
            greeting: 'Dear Supplier,',
            explanation: 'We are requesting a quote for the following items:',
            items: '',
            requirements: 'Please provide your best price and delivery time for these items.',
            instructions: 'Submit your quote through our web form at [Your Web Form URL]',
            contactInfo: 'If you have any questions, please contact us at [Your Contact Information]',
        };
    }

    saveEmailTemplate(template: any) {
        // Implement logic to save the email template
        // This could be to a service or local storage
        console.log('Saving email template:', template);
    }

    viewDeliveryInfo() {
        const dialogRef = this.dialog.open(DeliveryInformationModalComponent, {
            width: '600px',
            data: { deliveryAddress: this.deliveryAddress },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.deliveryAddress = result;
                this.saveDeliveryInfo(result);
            }
        });
    }

    saveDeliveryInfo(deliveryInfo: DeliveryAddress) {
        // Implement logic to save the delivery information
        // This could be to a service or API
        console.log('Saving delivery information:', deliveryInfo);
    }

    viewReceivedQuotes(selectedOrder: any) {
        if (!selectedOrder) {
            this.snackBar.open('Please select an order to view received quotes', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return;
        }

        if (selectedOrder.Quote_Status === 'Draft') {
            this.snackBar.open('This order is in draft status. There are no received quotes.', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return;
        }

        this.isSidePaneOpen = true;
    }

    async openReceiveOrderModal(orderData: any) {
        if (orderData.Order_Status === 'Completed') {
            this.snackBar.open('This order has already been marked as received.', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return;
        }

        if (orderData.Quote_Status !== 'Accepted') {
            this.snackBar.open('Only orders with accepted quotes can be marked as received.', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
            return;
        }

        const dialogRef = this.dialog.open(ReceiveOrderModalComponent, {
            width: '50vw',
            maxWidth: '2700px',
            data: orderData,
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result && result.action === 'received') {
                await this.loadOrdersData();
                this.gridComponent.refreshGrid(this.rowData);
            }
        });
    }

    async markOrderAsReceived(orderData: any) {
        try {
            const session = await fetchAuthSession();
            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = {
                body: JSON.stringify({
                    orderID: orderData.Order_ID,
                    orderDate: orderData.Order_Date,
                }),
            };

            const invokeCommand = new InvokeCommand({
                FunctionName: 'receiveOrder',
                Payload: new TextEncoder().encode(JSON.stringify(payload)),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                const result = JSON.parse(responseBody.body);
                console.log('Order marked as received:', result);

                // Update local data
                const index = this.rowData.findIndex((order) => order.Order_ID === orderData.Order_ID);
                if (index !== -1) {
                    this.rowData[index] = result.updatedOrder;
                }

                // Reload the orders data
                await this.loadOrdersData();

                // Refresh the grid
                this.gridComponent.refreshGrid(this.rowData);

                // Show success message
                this.snackBar.open('Order marked as received successfully', 'Close', {
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                });
            } else {
                throw new Error(responseBody.body || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error marking order as received:', error);
            this.snackBar.open(`Error marking order as received: ${(error as Error).message}`, 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    openAutomationSettingsModal() {
        const dialogRef = this.dialog.open(AutomationSettingsModalComponent, {
            width: '600px',
            data: { ordersComponent: this },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'opening_scan_confirmation') {
                // Do nothing, as the scan confirmation dialog will handle reopening if needed
            } else if (result) {
                console.log('New automation settings:', result);
                // Handle the new settings
            }
        });
    }

    async onQuoteAccepted() {
        await this.loadOrdersData();
        this.gridComponent.refreshGrid(this.rowData);
        this.isSidePaneOpen = false; // Optionally close the side pane
    }
}
