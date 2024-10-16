import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { QuoteAcceptConfirmationDialogComponent } from './quote-accept-confirmation-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';
import { SupplierRenegotiationModalComponent } from '../supplier-renegotiation-modal/supplier-renegotiation-modal.component';
import { OrdersService } from '../../../../amplify/services/orders.service';

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
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule, QuoteAcceptConfirmationDialogComponent, MatSnackBarModule, LoadingSpinnerComponent, SupplierRenegotiationModalComponent],
  templateUrl: './supplier-quote-details.component.html',
  styleUrl: './supplier-quote-details.component.css'
})
export class SupplierQuoteDetailsComponent implements OnInit {
  supplierInfo: any;
  quoteItems: QuoteItem[] = [];
  quoteSummary: QuoteSummary | null = null;
  isLoading = true;
  isAcceptingQuote = false;
  error: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<SupplierQuoteDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
    quoteID: string; 
    supplierID: string; 
    orderID: string; 
    orderDate: string;},
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ordersService: OrdersService
  ) {
    console.log(data);
  }

  ngOnInit() {
    this.loadQuoteDetails();
  }

  async loadQuoteDetails() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);
  
      this.ordersService.getSupplierQuoteDetails(this.data.quoteID, this.data.supplierID, tenentId)
        .subscribe(
          (quoteDetails) => {
            this.supplierInfo = quoteDetails.supplierInfo;
            this.quoteItems = quoteDetails.quoteItems;
            this.quoteSummary = quoteDetails.quoteSummary;
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching quote details:', error);
            this.error = 'Failed to load quote details. Please try again.';
            this.isLoading = false;
          }
        );
    } catch (error) {
      console.error('Error in loadQuoteDetails:', error);
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
        this.isLoading = true; // Set to true before accepting the quote
        this.acceptQuote();
      }
    });
  }

  async acceptQuote(): Promise<void> {
    try {
      this.isLoading = true;
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);
  
      const payloadBody = {
        orderID: this.data.orderID,
        orderDate: this.data.orderDate,
        selectedSupplier: this.supplierInfo.company_name,
        supplierID: this.data.supplierID,
        expectedDeliveryDate: this.quoteSummary?.Delivery_Date,
        tenentId: tenentId
      };
  
      console.log('Payload being sent to acceptQuote:', payloadBody);
  
      const response = await this.ordersService.acceptQuote(payloadBody).toPromise();
  
      console.log('Response from acceptQuote:', response);
  
      if (response && response.message) {
        this.snackBar.open('Quote accepted successfully', 'Close', {
          duration: 6000,
          verticalPosition: 'top'
        });
        this.dialogRef.close({ action: 'quoteAccepted' });
      } else {
        throw new Error('Failed to accept quote');
      }
    } catch (error) {
      console.error('Error accepting quote:', error);
      this.snackBar.open(`Error accepting quote: ${(error as Error).message}`, 'Close', {
        duration: 6000,
        verticalPosition: 'top'
      });
    } finally {
      this.isLoading = false;
    }
  }


  openRenegotiateModal(): void {
    this.dialogRef.close(); // Close the supplier-quote-details modal

    const renegotiateDialogRef = this.dialog.open(SupplierRenegotiationModalComponent, {
      width: '800px',
      data: {
        supplierName: this.supplierInfo.company_name,
        supplierEmail: this.supplierInfo.contact_email,
        quoteID: this.data.quoteID,
        orderID: this.data.orderID,
        supplierID: this.data.supplierID
      }
    });

    renegotiateDialogRef.afterClosed().subscribe(result => {
      if (result === 'cancelled') {
        // Reopen the supplier-quote-details modal if renegotiation was cancelled
        this.dialog.open(SupplierQuoteDetailsComponent, {
          width: '90%',
          maxWidth: '1350px',
          data: this.data
        });
      } else if (result) {
        // Handle successful renegotiation
        console.log('Renegotiation email sent:', result);
        // You may want to show a success message or perform other actions here
      }
    });
  }
}