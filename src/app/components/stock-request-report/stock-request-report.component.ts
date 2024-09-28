import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitleService } from '../header/title.service';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';
import { MatAutocompleteModule, MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InventoryService } from '../../../../amplify/services/inventory.service';

@Component({
    selector: 'app-stock-request-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatInputModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
    ],
    templateUrl: './stock-request-report.component.html',
    styleUrls: ['./stock-request-report.component.css'],
})
export class StockRequestReportComponent implements OnInit {
    @ViewChild(MatAutocompleteTrigger) autocompleteTrigger!: MatAutocompleteTrigger;

    tenentId: string = '';
    period: string = 'DAILY';
    startDate: Date = new Date();
    endDate: Date = new Date();
    searchTerm: string = '';
    selectedItem: any = null;
    aggregatedData: any[] = [];
    inventoryItems: any[] = [];
    filteredItems: any[] = [];

    constructor(
        private titleService: TitleService,
        private changeDetectorRef: ChangeDetectorRef,
        private inventoryService: InventoryService
    ) {}

    async ngOnInit() {
        const session = await fetchAuthSession();
        this.titleService.updateTitle('Stock Requests Report');
        this.tenentId = await this.getTenentId(session);
        await this.getInventoryItems();
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
            throw new Error('TenantId not found in user attributes');
        }

        return tenentId;
    }

    async getInventoryItems() {
        try {
            const response = await this.inventoryService.inventorySummaryGetItems({ tenentId: this.tenentId }).toPromise();
            
            if (response) {
                this.inventoryItems = response;
                this.filteredItems = this.inventoryItems;
            } else {
                console.error('No data received from inventory summary API');
            }
        } catch (error) {
            console.error('Error fetching inventory items:', error);
        }
    }
    

    filterItems() {
        this.filteredItems = this.inventoryItems.filter(
            (item) =>
                item.SKU.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(this.searchTerm.toLowerCase()),
        );
    }

    selectItem(item: any) {
        this.selectedItem = item;
        this.searchTerm = item.SKU;
        this.aggregatedData = []; // Clear previous results when a new item is selected
        this.filteredItems = []; // Clear filtered items
        this.autocompleteTrigger.closePanel(); // Close the autocomplete panel
        this.changeDetectorRef.detectChanges(); // Force change detection
    }

    clearSelection() {
        this.selectedItem = null;
        this.searchTerm = '';
        this.aggregatedData = []; // Clear results when selection is cleared
        this.filteredItems = this.inventoryItems; // Reset filtered items to all items
        this.changeDetectorRef.detectChanges(); // Force change detection
    }
    async getAggregatedData() {
        const session = await fetchAuthSession();
        const lambdaClient = new LambdaClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials,
        });

        const command = new InvokeCommand({
            FunctionName: 'getStockRequestAggregates',
            Payload: JSON.stringify({
                tenentId: this.tenentId,
                period: this.period,
                startDate: this.startDate.toISOString().split('T')[0],
                endDate: this.endDate.toISOString().split('T')[0],
                sku: this.selectedItem?.SKU,
            }),
        });

        try {
            const { Payload } = await lambdaClient.send(command);
            const result = JSON.parse(new TextDecoder().decode(Payload));
            if (result.statusCode === 200) {
                this.aggregatedData = JSON.parse(result.body);
                this.sortAggregatedData();
                this.changeDetectorRef.detectChanges();
            }
        } catch (error) {
            console.error('Error fetching aggregated data:', error);
        }
    }

    sortAggregatedData() {
        this.aggregatedData.sort((a, b) => {
            if (a.date !== b.date) {
                return a.date.localeCompare(b.date);
            }
            return a.sku.localeCompare(b.sku);
        });
    }
}
