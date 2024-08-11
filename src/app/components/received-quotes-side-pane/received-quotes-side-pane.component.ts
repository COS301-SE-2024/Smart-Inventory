import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { MatDialog } from '@angular/material/dialog';
import { SupplierQuoteDetailsComponent } from '../supplier-quote-details/supplier-quote-details.component';

interface SupplierQuote {
  SupplierID: string;
  supplier_name: string;
  Total_Quote_Value: number;
  Delivery_Date: string;
  Delivery_Cost: number;
  Currency: string;
}

@Component({
  selector: 'app-received-quotes-side-pane',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './received-quotes-side-pane.component.html',
  styleUrls: ['./received-quotes-side-pane.component.css']
})
export class ReceivedQuotesSidePaneComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() selectedOrder: any;
  @Output() closed = new EventEmitter<void>();
  @Output() quoteAccepted = new EventEmitter<void>();

  supplierQuotes: SupplierQuote[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedOrder'] && this.selectedOrder) {
      this.fetchSupplierQuotes();
    }
  }

  close() {
    this.closed.emit();
  }

  async fetchSupplierQuotes() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getSupplierQuoteSummaries',
        Payload: new TextEncoder().encode(JSON.stringify({
          pathParameters: {
            quoteId: this.selectedOrder.Quote_ID,
            tenentId: tenentId
          }
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        this.supplierQuotes = JSON.parse(responseBody.body);
        console.log('Supplier quotes:', this.supplierQuotes);
      } else {
        console.error('Error fetching supplier quotes:', responseBody.body);
      }
    } catch (error) {
      console.error('Error in fetchSupplierQuotes:', error);
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


  viewQuoteDetails(quote: any) {
    const dialogRef = this.dialog.open(SupplierQuoteDetailsComponent, {
      width: '90%',
      maxWidth: '1350px',
      data: {
        quoteID: quote.QuoteID,
        supplierID: quote.SupplierID,
        orderID: this.selectedOrder.Order_ID,
        orderDate: this.selectedOrder.Order_Date
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'quoteAccepted') {
        // Quote was accepted, refresh the data and notify the parent component
        this.fetchSupplierQuotes();
        this.quoteAccepted.emit();
      }
    });
  }

}