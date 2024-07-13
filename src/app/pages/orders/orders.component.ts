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
    imports: [GridComponent, MatButtonModule, MatDialogModule],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit{
    @ViewChild(GridComponent) gridComponent!: GridComponent;
    constructor(private titleService: TitleService, private dialog: MatDialog) {
        Amplify.configure(outputs);
    }

    rowData: any[] = [];

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

    async ngOnInit() {
        this.titleService.updateTitle('Orders');
        await this.loadOrdersData();
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
            FunctionName: 'getOrders',
            Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
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
            }));
            console.log('Processed orders:', this.rowData);
        } else {
            console.error('Error fetching orders data:', responseBody.body);
            this.rowData = [];
        }
    } catch (error) {
        console.error('Error in loadOrdersData:', error);
        this.rowData = [];
    }
  }

  
}
