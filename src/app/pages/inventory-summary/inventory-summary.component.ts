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
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';

@Component({
  selector: 'app-inventory-summary',
  standalone: true,
  imports: [
    GridComponent,
    MatButtonModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './inventory-summary.component.html',
  styleUrls: ['./inventory-summary.component.css']
})
export class InventorySummaryComponent implements OnInit {
  @ViewChild('gridComponent') gridComponent!: GridComponent;

  rowData: any[] = [];
  isLoading = true;
  tenentId: string = '';

  colDefs: ColDef[] = [
    { field: 'SKU', headerName: 'SKU', filter: 'agSetColumnFilter' },
    { field: 'description', headerName: 'Description', filter: 'agSetColumnFilter' },
    { field: 'quantity', headerName: 'Quantity', filter: 'agSetColumnFilter' },
    { field: 'lowStockThreshold', headerName: 'Low Stock Threshold', filter: 'agSetColumnFilter' },
    { field: 'reorderAmount', headerName: 'Reorder Amount', filter: 'agSetColumnFilter' },
    { field: 'EOQ', headerName: 'EOQ', filter: 'agSetColumnFilter' },
    { field: 'safetyStock', headerName: 'Safety Stock', filter: 'agSetColumnFilter' },
    { field: 'updatedAt', headerName: 'Last Updated', filter: 'agSetColumnFilter' },
  ];

  constructor(private snackBar: MatSnackBar) {
    Amplify.configure(outputs);
  }

  async ngOnInit(): Promise<void> {
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

  async loadInventorySummaryData() {
    try {
      const session = await fetchAuthSession();

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'inventorySummary-getItems',
        Payload: new TextEncoder().encode(JSON.stringify({ tenentId: this.tenentId })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        this.rowData = JSON.parse(responseBody.body);
      } else {
        throw new Error(responseBody.body);
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

  handleCellValueChanged(event: { data: any; field: string; newValue: any }) {
    // Implement logic to update the inventory summary item
    console.log('Cell value changed:', event);
    // You may want to call a Lambda function to update the item in DynamoDB
  }
}