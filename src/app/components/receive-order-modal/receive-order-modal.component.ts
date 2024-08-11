import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { provideNativeDateAdapter } from '@angular/material/core';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';

interface OrderItem {
  sku: string;
  description: string;
  quantity: number;
  expirationDate: Date | null;
  upc: string;
  category: string;
  lowStockThreshold: number;
  reorderAmount: number;
  inventoryID: string;
  quoteID: string;
}

@Component({
  selector: 'app-receive-order-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatIconModule
  ],
  providers: [
    MatDatepickerModule,
    provideNativeDateAdapter()
  ],
  templateUrl: './receive-order-modal.component.html',
  styleUrls: ['./receive-order-modal.component.css']
})
export class ReceiveOrderModalComponent implements OnInit {
  displayedColumns: string[] = ['sku', 'description', 'quantity', 'expirationDate'];
  orderItems: OrderItem[] = [];

  constructor(
    public dialogRef: MatDialogRef<ReceiveOrderModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  async ngOnInit() {
    await this.loadQuoteItems();
  }

  async loadQuoteItems() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getQuoteItems',
        Payload: new TextEncoder().encode(JSON.stringify({
          pathParameters: {
            tenentId: tenentId,
            quoteID: this.data.Quote_ID
          }
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      console.log('Lambda response:', responseBody);

      if (responseBody.statusCode === 200) {
        const items = JSON.parse(responseBody.body);
        this.orderItems = items.map((item: any) => ({
          sku: item.ItemSKU,
          description: item.Description,
          quantity: item.Quantity,
          expirationDate: null,
          upc: item.UPC,
          category: item.Category,
          lowStockThreshold: item.LowStockThreshold,
          reorderAmount: item.ReorderAmount,
          inventoryID: item.inventoryID,
          quoteID: item.QuoteID
        }));
      } else {
        console.error('Error fetching quote items:', responseBody.body);
      }
    } catch (error) {
      console.error('Error in loadQuoteItems:', error);
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

    console.log('TenentId:', tenentId);

    return tenentId;
  }

  markAsReceived() {
    this.dialogRef.close({ action: 'received', data: this.orderItems });
  }

  close() {
    this.dialogRef.close();
  }
}