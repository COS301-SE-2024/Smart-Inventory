import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';

interface QuoteItem {
    item: { sku: string; description: string; inventoryID: string };
    quantity: number;
    filteredItems: ReplaySubject<{ sku: string; description: string }[]>;
    searchControl: FormControl;
}

interface InventoryItem {
    sku: string;
    description: string;
    inventoryID: string;
}

@Component({
    selector: 'app-custom-quote-modal',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        NgxMatSelectSearchModule,
        LoadingSpinnerComponent,
        MatTooltipModule,
    ],
    templateUrl: './template-quote-modal.component.html',
    styleUrls: ['./template-quote-modal.component.css'],
})
export class templateQuoteModalComponent implements OnInit {
    isLoading = true;
    quoteItems: QuoteItem[] = [];
    filteredQuoteItems: QuoteItem[] = [];
    quoteItemSearchTerm: string = '';
    selectedSuppliers: { company_name: string; supplierID: string }[] = [];
    suppliers: { company_name: string; supplierID: string }[] = [];
    inventoryItems: { sku: string; description: string }[] = [];
    selectedFrequency: string = 'Monthly';

    supplierControl = new FormControl();
    filteredSuppliers: ReplaySubject<{ company_name: string; supplierID: string }[]> = new ReplaySubject<
        { company_name: string; supplierID: string }[]
    >(1);

    isEditing: boolean = false;
    isNewQuote: boolean = false;
    hasUnsavedChanges: boolean = false;

    protected _onDestroy = new Subject<void>();

    constructor(
        public dialogRef: MatDialogRef<templateQuoteModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private snackBar: MatSnackBar,
    ) {
        this.isEditing = data.isEditing || false;
        this.isNewQuote = data.isNewQuote || false;

        console.log('Received data in modal:', data); // Add this log
    }

    private defaultEmailBody = `Dear {{SUPPLIER_NAME}},

  We are requesting a quote for our order. Please use the following unique link to submit your quote:
  {{WEB_FORM_URL}}
  
  Thank you for your prompt attention to this matter.
  
  Best regards`;

    async ngOnInit() {
        this.isLoading = true;
        try {
            await Promise.all([this.loadInventoryItems(), this.loadSuppliers()]);

            if (this.data.quoteDetails) {
                this.initializeQuoteData(this.data.quoteDetails);
            } else {
                this.addItem();
            }

            this.filteredSuppliers.next(this.suppliers.slice());
            this.supplierControl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
                this.filterSuppliers();
            });
        } finally {
            this.isLoading = false;
        }
    }

    initializeQuoteData(quoteDetails: any) {
        console.log('Initializing quote data:', quoteDetails); // Add this log
        if (quoteDetails.items && Array.isArray(quoteDetails.items)) {
            this.quoteItems = quoteDetails.items.map((item: any) => {
                const inventoryItem = this.inventoryItems.find((invItem) => invItem.sku === item.ItemSKU);
                return {
                    item: inventoryItem || { sku: item.ItemSKU, description: 'Unknown Item' },
                    quantity: item.Quantity,
                    filteredItems: new ReplaySubject<{ sku: string; description: string }[]>(1),
                    searchControl: new FormControl(),
                };
            });
        } else {
            console.warn('No items found in quote details');
            this.quoteItems = [];
        }

        this.selectedSuppliers =
            quoteDetails.suppliers && Array.isArray(quoteDetails.suppliers)
                ? quoteDetails.suppliers.map((supplier: any) => ({
                      company_name: supplier.company_name,
                      supplierID: supplier.supplierID,
                  }))
                : [];

        // Initialize filtered items for each quote item
        this.quoteItems.forEach((quoteItem) => {
            quoteItem.filteredItems.next(this.inventoryItems.slice());
        });

        this.filteredQuoteItems = this.quoteItems;
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    private filterSuppliers() {
        if (!this.suppliers) {
            return;
        }
        let search = this.supplierControl.value;
        if (!search) {
            this.filteredSuppliers.next(this.suppliers.slice());
            return;
        } else {
            search = search.toLowerCase();
        }
        this.filteredSuppliers.next(
            this.suppliers.filter((supplier) => supplier.company_name.toLowerCase().indexOf(search) > -1),
        );
    }

    filterItems(value: string, index: number) {
        const filterValue = value.toLowerCase();
        this.quoteItems[index].filteredItems.next(
            this.inventoryItems.filter(
                (item) =>
                    item.sku.toLowerCase().includes(filterValue) ||
                    item.description.toLowerCase().includes(filterValue),
            ),
        );
    }

    addItem() {
        const newFilteredItems = new ReplaySubject<{ sku: string; description: string }[]>(1);
        newFilteredItems.next(this.inventoryItems.slice());
        const newItem: QuoteItem = {
            item: { sku: '', description: '', inventoryID: '' },
            quantity: 1,
            filteredItems: newFilteredItems,
            searchControl: new FormControl(),
        };
        this.quoteItems.push(newItem);
        this.filterQuoteItems();
    }

    removeItem(index: number) {
        this.quoteItems.splice(index, 1);
        this.filterQuoteItems();
    }

    filterQuoteItems() {
        if (!this.quoteItemSearchTerm) {
            this.filteredQuoteItems = this.quoteItems;
        } else {
            const searchTerm = this.quoteItemSearchTerm.toLowerCase();
            this.filteredQuoteItems = this.quoteItems.filter(
                (item) =>
                    item.item.sku.toLowerCase().includes(searchTerm) ||
                    item.item.description.toLowerCase().includes(searchTerm),
            );
        }
    }

    removeSupplier(supplierToRemove: { company_name: string; supplierID: string }) {
        this.selectedSuppliers = this.selectedSuppliers.filter((s) => s.supplierID !== supplierToRemove.supplierID);
        this.onQuoteChanged();
    }

    async loadSuppliers() {
        try {
            const session = await fetchAuthSession();
            const tenentId = await this.getTenentId(session);

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getSuppliers',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                const suppliers = JSON.parse(responseBody.body);
                this.suppliers = suppliers.map((supplier: any) => ({
                    company_name: supplier.company_name,
                    supplierID: supplier.supplierID,
                }));
                console.log('Suppliers:', this.suppliers);
            } else {
                console.error('Error fetching suppliers data:', responseBody.body);
                this.suppliers = [];
            }
        } catch (error) {
            console.error('Error in loadSuppliers:', error);
            this.suppliers = [];
        }
    }

    async loadInventoryItems() {
        try {
            const session = await fetchAuthSession();
            const tenentId = await this.getTenentId(session);

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'Inventory-getItems',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                const inventoryItems = JSON.parse(responseBody.body);
                this.inventoryItems = inventoryItems.map((item: any) => ({
                    sku: item.SKU,
                    description: item.description,
                    inventoryID: item.inventoryID, // Add this line
                }));
                // Initialize filtered items for each quote item
                this.quoteItems.forEach((quoteItem) => {
                    quoteItem.filteredItems.next(this.inventoryItems.slice());
                });
            } else {
                console.error('Error fetching inventory data:', responseBody.body);
                this.inventoryItems = [];
            }
        } catch (error) {
            console.error('Error in loadInventoryItems:', error);
            this.inventoryItems = [];
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

    compareItems(item1: any, item2: any): boolean {
        return item1 && item2 ? item1.sku === item2.sku : item1 === item2;
    }

    // async saveChanges() {
    //     const updatedQuote = {
    //         quoteId: this.quoteId,
    //         items: this.quoteItems.map(({ item, quantity }) => ({
    //             ItemSKU: item.sku,
    //             Quantity: quantity,
    //             inventoryID: item.inventoryID,
    //         })),
    //         suppliers: this.selectedSuppliers.map((supplier) => ({
    //             company_name: supplier.company_name,
    //             supplierID: supplier.supplierID,
    //         })),
    //     };

    //     console.log('Saving changes with data:', JSON.stringify(updatedQuote, null, 2));

    //     try {
    //         await this.updateQuote(updatedQuote);

    //         this.hasUnsavedChanges = false; // Reset the flag after saving
    //         this.snackBar.open('Changes saved successfully', 'Close', {
    //             duration: 3000,
    //             horizontalPosition: 'center',
    //             verticalPosition: 'top',
    //         });
    //     } catch (error) {
    //         console.error('Error saving changes:', error);
    //         this.snackBar.open('Error saving changes', 'Close', {
    //             duration: 3000,
    //             horizontalPosition: 'center',
    //             verticalPosition: 'top',
    //         });
    //     }
    // }
    saveChanges() {}

    private async updateQuote(updatedQuote: any) {
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
                    quoteId: updatedQuote.quoteId,
                },
                body: JSON.stringify({
                    items: updatedQuote.items.map((item: any) => ({
                        ItemSKU: item.ItemSKU,
                        Quantity: item.Quantity,
                        inventoryID: item.inventoryID,
                    })),
                    suppliers: updatedQuote.suppliers.map((supplier: any) => ({
                        company_name: supplier.company_name,
                        supplierID: supplier.supplierID,
                    })),
                }),
            };

            console.log('Updating quote with payload:', JSON.stringify(payload, null, 2));

            const invokeCommand = new InvokeCommand({
                FunctionName: 'updateQuoteDetails', // Make sure this Lambda function name is correct
                Payload: new TextEncoder().encode(JSON.stringify(payload)),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            console.log('Lambda response:', JSON.stringify(responseBody, null, 2));

            if (responseBody.statusCode === 200) {
                console.log('Quote updated successfully');
            } else {
                throw new Error(responseBody.body || 'Failed to update quote');
            }
        } catch (error) {
            console.error('Error updating quote:', error);
            throw error; // Re-throw the error to be caught in the saveChanges method
        }
    }

    onQuoteChanged() {
        this.hasUnsavedChanges = true;
    }

    createOrder() {}
    // createOrder() {
    //     const order = {
    //         items: this.quoteItems.map(({ item, quantity }) => ({
    //             ItemSKU: item.sku,
    //             Quantity: quantity,
    //             inventoryID: item.inventoryID,
    //         })),
    //         suppliers: this.selectedSuppliers.map((supplier) => ({
    //             company_name: supplier.company_name,
    //             supplierID: supplier.supplierID,
    //         })),
    //         Quote_Status: 'Draft',
    //         frequency: this.selectedFrequency,
    //     };
    //     console.log(order);
    //     this.dialogRef.close({ action: 'createOrder', data: order });
    // }

    cancel() {
        this.dialogRef.close({ action: 'cancel' });
    }

    // async sendQuote() {
    //     if (this.hasUnsavedChanges) {
    //         this.snackBar.open('Please save changes before sending the quote.', 'Close', {
    //             duration: 5000,
    //             horizontalPosition: 'center',
    //             verticalPosition: 'top',
    //         });
    //         return;
    //     }
    //     if (!this.isNewQuote) {
    //         console.log('Sending quote...');
    //         const emailData = await this.prepareEmailData();

    //         // Send emails
    //         await this.sendEmails(emailData);

    //         this.dialogRef.close({
    //             action: 'sendQuote',
    //             data: {
    //                 quoteId: this.quoteId,
    //                 items: this.quoteItems,
    //                 suppliers: this.selectedSuppliers,
    //                 emailData: emailData,
    //             },
    //         });
    //     }
    // }

    // async prepareEmailData() {
    //     const session = await fetchAuthSession();
    //     const tenentId = await this.getTenentId(session);
    //     const deliveryInfoID = await this.getDeliveryInfoID(tenentId);
    //     const emailTemplate = await this.getEmailTemplate(tenentId);

    //     const emailDataPromises = this.selectedSuppliers.map(async (supplier) => {
    //         const supplierDetails = await this.getSupplierDetails(tenentId, supplier.supplierID);
    //         const uniqueLink = `http://localhost:4200/supplier-form/${supplier.supplierID}/${this.quoteId}/${deliveryInfoID}/${tenentId}`;

    //         let emailBody = emailTemplate || this.defaultEmailBody;
    //         emailBody = emailBody
    //             .replace('{{SUPPLIER_NAME}}', supplier.company_name)
    //             .replace('{{WEB_FORM_URL}}', uniqueLink);

    //         return {
    //             supplierEmail: supplierDetails.contact_email,
    //             supplierName: supplier.company_name,
    //             emailBody: emailBody,
    //             orderId: this.orderId, // Include the order ID in the email data
    //             quoteId: this.quoteId, // Include the quote ID as well for completeness
    //         };
    //     });

    //     const emailData = await Promise.all(emailDataPromises);
    //     console.log('Email data:', emailData);
    //     return emailData;
    // }

    // async getEmailTemplate(tenentId: string): Promise<string | null> {
    //     const lambdaClient = new LambdaClient({
    //         region: outputs.auth.aws_region,
    //         credentials: (await fetchAuthSession()).credentials,
    //     });

    //     const invokeCommand = new InvokeCommand({
    //         FunctionName: 'getEmailTemplate',
    //         Payload: new TextEncoder().encode(
    //             JSON.stringify({
    //                 pathParameters: { tenentId: tenentId },
    //             }),
    //         ),
    //     });

    //     const lambdaResponse = await lambdaClient.send(invokeCommand);
    //     const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

    //     if (responseBody.statusCode === 200) {
    //         const { emailBody } = JSON.parse(responseBody.body);
    //         return emailBody;
    //     } else if (responseBody.statusCode === 404) {
    //         console.log('No custom email template found for this tenant. Using default template.');
    //         return null;
    //     } else {
    //         console.error('Error fetching email template:', responseBody.body);
    //         return null;
    //     }
    // }

    // async sendEmails(emailData: any[]) {
    //     const lambdaClient = new LambdaClient({
    //         region: outputs.auth.aws_region,
    //         credentials: (await fetchAuthSession()).credentials,
    //     });

    //     const invokeCommand = new InvokeCommand({
    //         FunctionName: 'sendSupplierEmails',
    //         Payload: new TextEncoder().encode(JSON.stringify({ emailData: emailData })),
    //     });

    //     const lambdaResponse = await lambdaClient.send(invokeCommand);
    //     const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

    //     if (responseBody.statusCode === 200) {
    //         console.log('Emails sent successfully:', responseBody.body);
    //     } else {
    //         throw new Error(`Failed to send emails: ${responseBody.body}`);
    //     }
    // }

    // async getSupplierDetails(tenentId: string, supplierID: string): Promise<any> {
    //     const lambdaClient = new LambdaClient({
    //         region: outputs.auth.aws_region,
    //         credentials: (await fetchAuthSession()).credentials,
    //     });

    //     const invokeCommand = new InvokeCommand({
    //         FunctionName: 'getSupplier',
    //         Payload: new TextEncoder().encode(
    //             JSON.stringify({
    //                 pathParameters: { tenentId: tenentId, supplierID: supplierID },
    //             }),
    //         ),
    //     });

    //     const lambdaResponse = await lambdaClient.send(invokeCommand);
    //     const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

    //     if (responseBody.statusCode === 200) {
    //         return JSON.parse(responseBody.body);
    //     } else {
    //         throw new Error(`Failed to get supplier details: ${responseBody.body}`);
    //     }
    // }

    // async getDeliveryInfoID(tenentId: string): Promise<string> {
    //     const lambdaClient = new LambdaClient({
    //         region: outputs.auth.aws_region,
    //         credentials: (await fetchAuthSession()).credentials,
    //     });

    //     const invokeCommand = new InvokeCommand({
    //         FunctionName: 'getDeliveryID',
    //         Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
    //     });

    //     const lambdaResponse = await lambdaClient.send(invokeCommand);
    //     const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

    //     if (responseBody.statusCode === 200) {
    //         const { deliveryInfoID } = JSON.parse(responseBody.body);
    //         return deliveryInfoID;
    //     } else {
    //         throw new Error('Failed to get deliveryInfoID');
    //     }
    // }
}