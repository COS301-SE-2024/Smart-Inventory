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
import { CustomQuoteModalComponent } from '../../components/quote/custom-quote-modal/custom-quote-modal.component';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [GridComponent, MatButtonModule, MatDialogModule, CommonModule, LoadingSpinnerComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  @ViewChild(GridComponent) gridComponent!: GridComponent;

  isLoading = true;

  constructor(private titleService: TitleService, private dialog: MatDialog) {
    Amplify.configure(outputs);
  }

  rowData: any[] = [];
  selectedOrder: any = null;

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field: 'Order_ID', filter: 'agSetColumnFilter' },
    { field: 'Order_Date', filter: 'agDateColumnFilter' },
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
      }
    },
    { field: 'Order_Status', filter: 'agSetColumnFilter' },
    { field: 'Quote_ID', filter: 'agSetColumnFilter' },
    { field: 'Quote_Status', filter: 'agSetColumnFilter' },
    { field: 'Selected_Supplier', filter: 'agSetColumnFilter' },
    { field: 'Expected_Delivery_Date', filter: 'agDateColumnFilter' },
    { field: 'Actual_Delivery_Date', filter: 'agDateColumnFilter' },

  ];

  defaultColDef: ColDef = {
    flex: 1,
    editable: true,
  };

  openAddDialog() { }

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
      this.openCustomQuoteModal(quoteDetails, this.selectedOrder.Order_ID, this.selectedOrder.Quote_ID);
    } catch (error) {
      console.error('Error fetching quote details:', error);
      alert('Error fetching quote details');
    }
  }
  
  openCustomQuoteModal(quoteDetails: any, orderId: string, quoteId: string) {
    const dialogRef = this.dialog.open(CustomQuoteModalComponent, {
      width: '500px',
      data: {
        quoteDetails: {
          ...quoteDetails,
          orderId: orderId,
          quoteId: quoteId
        },
        isEditing: false,
        isNewQuote: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'saveChanges') {
        this.updateQuote(result.data);
      }
    });
  }

  async fetchQuoteDetails(quoteId: string) {
    const session = await fetchAuthSession();
    const tenentId = await this.getTenentId(session);

    const lambdaClient = new LambdaClient({
      region: outputs.auth.aws_region,
      credentials: session.credentials,
    });

    const invokeCommand = new InvokeCommand({
      FunctionName: 'getQuoteDetails',
      Payload: new TextEncoder().encode(JSON.stringify({
        pathParameters: { tenentId: tenentId, quoteId: quoteId }
      })),
    });

    const lambdaResponse = await lambdaClient.send(invokeCommand);
    const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

    if (responseBody.statusCode === 200) {
      return JSON.parse(responseBody.body);
    } else {
      throw new Error(responseBody.body);
    }
  }

  async updateQuote(updatedQuote: any) {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const payload = {
        pathParameters: {
          tenentId: tenentId,
          quoteId: this.selectedOrder.Quote_ID
        },
        body: JSON.stringify({
          items: updatedQuote.items.map((item: any) => ({
            ItemSKU: item.ItemSKU,
            Quantity: item.Quantity
          })),
          suppliers: updatedQuote.suppliers
        })
      };

      console.log('Updating quote with payload:', JSON.stringify(payload, null, 2));

      const invokeCommand = new InvokeCommand({
        FunctionName: 'updateQuoteDetails',
        Payload: new TextEncoder().encode(JSON.stringify(payload)),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      console.log('Lambda response:', JSON.stringify(responseBody, null, 2));

      if (responseBody.statusCode === 200) {
        console.log('Quote updated successfully');
        // Refresh the orders data
        await this.loadOrdersData();
      } else {
        throw new Error(responseBody.body);
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      alert(`Error updating quote: ${(error as Error).message}`);
    }
  }

  async createNewOrder(quoteData: any) {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);
  
      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });
  
      const newOrder = {
        Order_Date: new Date().toISOString().split('T')[0],
        Order_Status: 'Pending Approval',
        Quote_Status: quoteData.Quote_Status || 'Draft',
        Selected_Supplier: null,
        Expected_Delivery_Date: null,
        Actual_Delivery_Date: null,
        tenentId: tenentId,
        Creation_Time: new Date().toISOString(), // Add this line
        quoteItems: quoteData.items.map((item: any) => ({
          ItemSKU: item.ItemSKU,
          Quantity: item.Quantity
        })),
        suppliers: quoteData.suppliers
      };
  
      console.log('New Order Data:', newOrder);
  
      const invokeCommand = new InvokeCommand({
        FunctionName: 'createOrder',
        Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(newOrder) })),
      });
  
      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
      console.log('Lambda response:', responseBody);
  
      if (responseBody.statusCode === 201) {
        console.log('Order created successfully');
        await this.loadOrdersData();
        
        // Parse the response body to get the orderId and quoteId
        const { orderId, quoteId } = JSON.parse(responseBody.body);
        
        console.log('Created order ID:', orderId);
        console.log('Created quote ID:', quoteId);
  
        // Prepare the quote details for the modal
        const quoteDetails = {
          orderId: orderId,
          quoteId: quoteId,
          items: quoteData.items,
          suppliers: quoteData.suppliers
        };
        
        // Open the generated quote modal
        this.openCustomQuoteModal(quoteDetails, orderId, quoteId);
      } else {
        throw new Error(responseBody.body || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`Error creating order: ${(error as Error).message}`);
    }
  }

  async handleNewCustomQuote(event: { type: string, data: any }) {
    if (event.type === 'order') {
      await this.createNewOrder(event.data);
    }
    if (event.type === 'draft') {
      await this.createNewOrder({
        ...event.data,
        Quote_Status: 'Draft'
      });
    } else if (event.type === 'quote') {
      await this.createNewOrder({
        ...event.data,
        Quote_Status: 'Sent'
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

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getOrders',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
      console.log('Response from Lambda:', responseBody);

      if (responseBody.statusCode === 200) {
        const orders = JSON.parse(responseBody.body);
        this.rowData = orders.map((order: any) => ({
          Order_ID: order.Order_ID,
          Order_Date: order.Order_Date,
          Order_Status: order.Order_Status,
          Quote_ID: order.Quote_ID,
          Quote_Status: order.Quote_Status,
          Selected_Supplier: order.Selected_Supplier,
          Expected_Delivery_Date: order.Expected_Delivery_Date,
          Actual_Delivery_Date: order.Actual_Delivery_Date,
          Creation_Time: order.Creation_Time // Add this line
        }));
        console.log('Processed orders:', this.rowData);
      } else {
        console.error('Error fetching orders data:', responseBody.body);
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
    alert('Only orders with Draft quote status can be deleted');
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
        Payload: new TextEncoder().encode(JSON.stringify({
          pathParameters: {
            tenentId: tenentId,
            orderId: this.selectedOrder.Order_ID,
            quoteId: this.selectedOrder.Quote_ID
          }
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        console.log('Order deleted successfully');
        await this.loadOrdersData();
        this.selectedOrder = null;
        this.refreshGridSelection();
      } else {
        throw new Error(responseBody.body || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(`Error deleting order: ${(error as Error).message}`);
    }
  }
}


}
