import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Renderer2, ElementRef, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { MaterialModule } from '../../material/material.module';
import { Amplify } from 'aws-amplify';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { InventoryService } from '../../../../../amplify/services/inventory.service';

import outputs from '../../../../../amplify_outputs.json';

type DataYearly = {
    [year: string]: { name: string; data: number[] }[];
};

interface InventoryItem {
    category: string;
    quantity: number; // Current stock in inventory
}

interface StockRequest {
    category: string;
    quantityRequested: number;
}

type InventoryData = {
    [category: string]: {
        currentStock: number;
        requestedStock: number;
    };
};


@Component({
    selector: 'app-barchart',
    standalone: true,
    imports: [AgChartsAngular, CommonModule, FormsModule, MaterialModule],
    templateUrl: './barchart.component.html',
    styleUrls: ['./barchart.component.css'],
})
export class BarchartComponent implements AfterViewInit {
    public selectedYear: string = new Date().getFullYear().toString(); // Default to current year
    @Input() chartTitle: string = "Inventory vs. Stock Requests Comparison";
    public chartOptions: AgChartOptions;
    private themeObserver!: MutationObserver;

    private inventoryData: InventoryData = {};

    ngOnChanges(changes: SimpleChanges) {
        if (changes['chartTitle']) {
            // Code to update the chart's title, perhaps by redrawing the chart
        }
    }


    private lightTheme: AgChartTheme = {
        palette: {
            fills: ['#5C2983', '#0076C5', '#21B372'],
            strokes: ['#333333'],
        },
        baseTheme: 'ag-default',
    };

    private darkTheme: AgChartTheme = {
        palette: {
            fills: ['#8860D0', '#4098D7', '#56CF87'],
            strokes: ['#aaaaaa'],
        },
        baseTheme: 'ag-material-dark',
        overrides: {
            common: {
                background: {
                    fill: '#1E1E1E'
                }
            }
        }
    };


    updateChartData() {
        // const seriesData = this.getDataByYear(year);

        const data = Object.keys(this.inventoryData).map(category => ({
            category,
            CurrentStock: this.inventoryData[category].currentStock,
            RequestedStock: this.inventoryData[category].requestedStock
        }));
    
        this.chartOptions = {
            ...this.chartOptions,
            autoSize: true,
            data,
            title: {
                text: this.chartTitle,
            },
            series: [
                {
                    type: 'bar',
                    xKey: 'category',
                    yKey: 'CurrentStock',
                    yName: 'Current Stock',
                },
                {
                    type: 'bar',
                    xKey: 'category',
                    yKey: 'RequestedStock',
                    yName: 'Stock Requests',
                }
            ],
            axes: [
                {
                    type: 'category',
                    position: 'bottom',
                    title: {
                        text: 'Category',
                    }
                },
                {
                    type: 'number',
                    position: 'left',
                    title: {
                        text: 'Quantity',
                    },
                    label: {
                        formatter: ({ value }) => this.formatNumber(value),
                    }
                }
            ]
        };
    }

    formatNumber(value: number) {
        return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(value);
    }

    constructor(private renderer: Renderer2, private el: ElementRef, private inventoryService: InventoryService) {
        Amplify.configure(outputs);
        this.chartOptions = {};
        // this.initializeData();
        this.setupThemeObserver();
    }

    async loadStockRequestData() {
        // this.isLoading = true;
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

            const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;
            // const tenentId = '1718890159961-q85m9';

            if (!tenentId) {
                console.error('TenentId not found in user attributes');
                // this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getStockRequests',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const orders = JSON.parse(responseBody.body);
                orders.forEach((request: { category: string | number; quantityRequested: number; }) => {
                    if (this.inventoryData[request.category]) {
                        this.inventoryData[request.category].requestedStock = (this.inventoryData[request.category].requestedStock || 0) + request.quantityRequested;
                    } else {
                        this.inventoryData[request.category] = { currentStock: 0, requestedStock: request.quantityRequested };
                    }
                });
                this.updateChartData();
                console.log('Processed orders:', orders);
            } else {
                console.error('Error fetching orders data:', responseBody.body);
                // this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            // this.rowData = [];
        } finally {
            // this.isLoading = false;
        }
    }

    async loadInventoryData() {
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
                return;
            }
    
            this.inventoryService.getInventoryItems(tenantId).subscribe(
                (inventoryItems) => {
                    inventoryItems.forEach((item: { category: string | number; quantity: any; }) => {
                        this.inventoryData[item.category] = {
                            ...this.inventoryData[item.category],
                            currentStock: item.quantity
                        };
                    });
                    this.updateChartData();
                    console.log('Processed inventory items:', inventoryItems);
                },
                (error) => {
                    console.error('Error fetching inventory data:', error);
                }
            );
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
        } finally {
            // this.isLoading = false;
        }
    }

    // private initializeData() {
    //     // Sample data initialization, replace this with actual data fetching logic
    //     const inventories: InventoryItem[] = [
    //         { category: 'Electronics', quantity: 120 },
    //         { category: 'Food: Perishable', quantity: 80 },
    //         { category: 'Beverages: Non-Alcoholic', quantity: 200 }
    //     ];
    //     const stockRequests: StockRequest[] = [
    //         { category: 'Electronics', quantityRequested: 90 },
    //         { category: 'Food: Perishable', quantityRequested: 100 },
    //         { category: 'Beverages: Non-Alcoholic', quantityRequested: 150 }
    //     ];

    //     // Aggregating data for chart
    //     inventories.forEach(item => {
    //         this.inventoryData[item.category] = { currentStock: item.quantity, requestedStock: 0 };
    //     });

    //     stockRequests.forEach(request => {
    //         if (this.inventoryData[request.category]) {
    //             this.inventoryData[request.category].requestedStock += request.quantityRequested;
    //         }
    //     });
    // }

    async ngOnInit() {
        // this.updateChartData(this.selectedYear);
        this.updateChartData();
        await this.loadStockRequestData();
        await this.loadInventoryData();
    }

    ngAfterViewInit() {
        this.applyCurrentTheme();
        // const chartWrapper = this.el.nativeElement.querySelector('.ag-chart-wrapper');
        // if (chartWrapper) {
        //   this.renderer.setStyle(chartWrapper, 'position', 'absolute');
        // }
    }

    private setupThemeObserver() {
        this.themeObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.applyCurrentTheme();
                }
            });
        });
        this.themeObserver.observe(document.body, {
            attributes: true // Listen to attribute changes only.
        });
    }

    private applyCurrentTheme() {
        const theme = document.body.getAttribute('data-theme') === 'dark' ? this.darkTheme : this.lightTheme;
        this.chartOptions = {
            ...this.chartOptions, // Spread existing chart options to preserve other configurations
            theme: theme
        };
        this.updateChartData(); // Re-render the chart with the new theme
    }
}
