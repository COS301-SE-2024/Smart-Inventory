import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { QuoteAcceptConfirmationDialogComponent } from './quote-accept-confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface QuoteItem {
  description: string;
  upc: string;
  ItemSKU: string;
  AvailableQuantity: number;
  UnitPrice: number;
  TotalPrice: number;
  Discount: number;
  IsAvailable: boolean;
}

interface QuoteSummary {
  VAT_Percentage: number;
  Delivery_Date: string;
  Delivery_Cost: number;
  Subtotal: number;
  VAT_Amount: number;
  Total_Quote_Value: number;
  Currency: string;
  Additional_Comments?: string;
}

@Component({
  selector: 'app-supplier-quote-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, QuoteAcceptConfirmationDialogComponent, MatSnackBarModule],
  templateUrl: './supplier-quote-details.component.html',
  styleUrl: './supplier-quote-details.component.css'
})
export class SupplierQuoteDetailsComponent implements OnInit {
  supplierInfo: any;
  quoteItems: QuoteItem[] = [];
  quoteSummary: QuoteSummary | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<SupplierQuoteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
    quoteID: string; 
    supplierID: string; 
    orderID: string; 
    orderDate: string;},
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadQuoteDetails();
  }

  async loadQuoteDetails() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getSupplierQuoteDetails',
        Payload: new TextEncoder().encode(JSON.stringify({
          pathParameters: {
            quoteID: this.data.quoteID,
            supplierID: this.data.supplierID,
            tenentId: tenentId
          }
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        const quoteDetails = JSON.parse(responseBody.body);
        this.supplierInfo = quoteDetails.supplierInfo;
        this.quoteItems = quoteDetails.quoteItems;
        this.quoteSummary = quoteDetails.quoteSummary;
        this.isLoading = false;
      } else {
        throw new Error(responseBody.body || 'Failed to fetch quote details');
      }
    } catch (error) {
      console.error('Error fetching quote details:', error);
      this.error = 'Failed to load quote details. Please try again.';
      this.isLoading = false;
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

    return tenentId;
  }

  close(): void {
    this.dialogRef.close();
  }

  openAcceptQuoteDialog(): void {
    const dialogRef = this.dialog.open(QuoteAcceptConfirmationDialogComponent, {
      width: '350px',
      data: { supplierName: this.supplierInfo.company_name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.acceptQuote();
      }
    });
  }

  async acceptQuote(): Promise<void> {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);
  
      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });
  
      const payloadBody = {
        orderID: this.data.orderID,
        orderDate: this.data.orderDate,
        selectedSupplier: this.supplierInfo.company_name,
        supplierID: this.data.supplierID,
        expectedDeliveryDate: this.quoteSummary?.Delivery_Date
      };
  
      // Console log the payload
      console.log('Payload being sent to acceptQuote Lambda:', payloadBody);
  
      const invokeCommand = new InvokeCommand({
        FunctionName: 'acceptQuote',
        Payload: new TextEncoder().encode(JSON.stringify({ body: payloadBody })),
      });
  
      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
      // Console log the Lambda response
      console.log('Response from acceptQuote Lambda:', responseBody);
  
      if (responseBody.statusCode === 200) {
        this.snackBar.open('Quote accepted successfully', 'Close', {
          duration: 6000,
          verticalPosition: 'top'
        });
        this.dialogRef.close({ action: 'quoteAccepted' }); // Close the dialog and indicate success
      } else {
        throw new Error(responseBody.body || 'Failed to accept quote');
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      this.snackBar.open(`Error accepting quote: ${(error as Error).message}`, 'Close', {
        duration: 6000,
        verticalPosition: 'top'
      });
    }
  }
}