import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { SupplierQuoteDetailsComponent } from '../supplier-quote-details/supplier-quote-details.component';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';

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
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule, 
    MatFormFieldModule, 
    MatSelectModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './received-quotes-side-pane.component.html',
  styleUrls: ['./received-quotes-side-pane.component.css']
})
export class ReceivedQuotesSidePaneComponent implements OnChanges {
  @Input() selectedOrder: any;
  @Output() closed = new EventEmitter<void>();
  @Output() quoteAccepted = new EventEmitter<void>();

  sortCriteria: string = 'price';
  sortOrder: 'asc' | 'desc' = 'asc';
  sortedQuotes: SupplierQuote[] = [];
  paneWidth = 800; // Initial width
  private resizing = false;

  @Input() set isOpen(value: boolean) {
    this._isOpen = value;
    if (value && this.selectedOrder) {
        this.fetchSupplierQuotes();
    }
  }

  applySorting() {
    this.sortedQuotes = [...this.supplierQuotes].sort((a, b) => {
      let valueA, valueB;
      switch (this.sortCriteria) {
        case 'price':
          valueA = a.Total_Quote_Value;
          valueB = b.Total_Quote_Value;
          break;
        case 'date':
          valueA = new Date(a.Delivery_Date).getTime();
          valueB = new Date(b.Delivery_Date).getTime();
          break;
        case 'deliveryCost':
          valueA = a.Delivery_Cost;
          valueB = b.Delivery_Cost;
          break;
        default:
          return 0;
      }
      return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
    });
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applySorting();
  }

  get isOpen(): boolean {
      return this._isOpen;
  }
  
  private _isOpen: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
      if (changes['selectedOrder'] && this.selectedOrder && this.isOpen) {
          this.fetchSupplierQuotes();
      }
  }

  supplierQuotes: SupplierQuote[] = [];
  isLoading: boolean = false;
  noQuotesReceived: boolean = false;

  constructor(private dialog: MatDialog) {}

  close() {
    this.closed.emit();
  }

  setSortCriteria(criteria: string) {
    if (this.sortCriteria === criteria) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortCriteria = criteria;
      this.sortOrder = 'asc';
    }
    this.applySorting();
  }

  getSortIcon(criteria: string): string {
    if (this.sortCriteria !== criteria) {
      return 'unfold_more';
    }
    return this.sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  async fetchSupplierQuotes() {
    this.isLoading = true;
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
        this.noQuotesReceived = this.supplierQuotes.length === 0;
        this.applySorting();
        console.log('Supplier quotes:', this.supplierQuotes);
      } else {
        console.error('Error fetching supplier quotes:', responseBody.body);
        this.noQuotesReceived = true;
      }
    } catch (error) {
      console.error('Error in fetchSupplierQuotes:', error);
      this.noQuotesReceived = true;
    } finally {
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

    console.log(tenentId);

    return tenentId;
  }


  viewQuoteDetails(quote: any) {
    const dialogRef = this.dialog.open(SupplierQuoteDetailsComponent, {
      width: '90%',
      maxWidth: '1350px',
      height: '90vh',
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

  startResize(event: MouseEvent) {
    this.resizing = true;
    event.preventDefault();
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  private resize = (event: MouseEvent) => {
    if (this.resizing) {
      const newWidth = window.innerWidth - event.clientX;
      if (newWidth > 400 && newWidth < 1200) { // Set min and max width
        this.paneWidth = newWidth;
      }
    }
  }

  private stopResize = () => {
    this.resizing = false;
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResize);
  }

  ngOnDestroy() {
    this.stopResize();
  }

}