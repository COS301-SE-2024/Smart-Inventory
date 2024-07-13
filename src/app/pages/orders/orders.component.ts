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

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [GridComponent, MatButtonModule],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit{
    @ViewChild(GridComponent) gridComponent!: GridComponent;
    constructor(private titleService: TitleService, private dialog: MatDialog) {
        Amplify.configure(outputs);
    }

    // Row Data: The data to be displayed.
    rowData = [
        {
            Order_ID: '#101',
            Order_Date: '2024-07-01',
            Order_Status: 'Pending Approval',
            Quote_ID: 'Q001',
            Quote_Status: 'Draft',
            Selected_Supplier: '',
            Expected_Delivery_Date: '',
            Actual_Delivery_Date: '',
        },
        {
            Order_ID: '#102',
            Order_Date: '2024-07-02',
            Order_Status: 'Quote Sent to Suppliers',
            Quote_ID: 'Q002',
            Quote_Status: 'Sent',
            Selected_Supplier: '',
            Expected_Delivery_Date: '',
            Actual_Delivery_Date: '',
        },
        {
            Order_ID: '#103',
            Order_Date: '2024-07-03',
            Order_Status: 'Awaiting Arrival',
            Quote_ID: 'Q003',
            Quote_Status: 'Accepted',
            Selected_Supplier: 'Takealot',
            Expected_Delivery_Date: '2024-07-10',
            Actual_Delivery_Date: '',
        },
        {
            Order_ID: '#104',
            Order_Date: '2024-07-04',
            Order_Status: 'Received',
            Quote_ID: 'Q004',
            Quote_Status: 'Accepted',
            Selected_Supplier: 'Amazon',
            Expected_Delivery_Date: '2024-07-08',
            Actual_Delivery_Date: '2024-07-07',
        },
    ];

    // Column Definitions: Defines & controls grid columns.
    colDefs: ColDef[] = [
        { field: 'Order_ID', filter: 'agSetColumnFilter' },
        { field: 'Order_Date', filter: 'agDateColumnFilter' },
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

    openAddDialog() {}

    ngOnInit() {
        this.titleService.updateTitle('Orders');
    }

      // Add this method to handle the new custom quote
      async handleNewCustomQuote(event: { type: string, data: any }) {
        if (event.type === 'draft') {
          await this.createNewOrder(event.data, 'Draft');
        } else if (event.type === 'quote') {
          await this.createNewOrder(event.data, 'Sent');
        }
      }
    
      async createNewOrder(quoteData: any, status: string) {
        try {
          const session = await fetchAuthSession();
          const tenentId = await this.getTenentId(session);
          console.log(tenentId);
    
          const lambdaClient = new LambdaClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials,
          });
    
          const newOrder = {
            Order_Date: new Date().toISOString().split('T')[0],
            Order_Status: 'Pending Approval',
            Quote_Status: status,
            Selected_Supplier: null,
            Expected_Delivery_Date: null,
            Actual_Delivery_Date: null,
            tenentId: tenentId,
            quoteItems: quoteData.items,
            suppliers: quoteData.suppliers
          };
    
          const invokeCommand = new InvokeCommand({
            FunctionName: 'createOrder',
            Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(newOrder) })),
          });
    
          const lambdaResponse = await lambdaClient.send(invokeCommand);
          const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
    
          if (responseBody.statusCode === 201) {
            console.log('Order created successfully');
            await this.loadOrdersData();
          } else {
            throw new Error(responseBody.body);
          }
        } catch (error) {
          console.error('Error creating order:', error);
          alert(`Error creating order: ${(error as Error).message}`);
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
    // Implement this method to fetch orders from the database
    // Similar to how you've implemented loadInventoryData() in other components
  }
}
