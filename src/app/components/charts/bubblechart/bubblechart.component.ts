import { Component, OnDestroy, OnInit, AfterViewInit, SimpleChanges, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { Amplify } from 'aws-amplify';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';

import outputs from '../../../../../amplify_outputs.json';
@Component({
    selector: 'app-bubblechart',
    standalone: true,
    imports: [AgChartsAngular],
    templateUrl: './bubblechart.component.html',
    styleUrl: './bubblechart.component.css',
})

export class BubblechartComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    public chartOptions!: AgChartOptions;
    private themeObserver!: MutationObserver;
    @Input() data: any[] = [];
    @Input() chartTitle: string = "";

    ngOnChanges(changes: SimpleChanges) {
        if (changes['chartTitle'] || changes['data']) {
            // const data = this.generateChartData(this.data);
            // this.data = data;
            this.updateChart();
            this.cdr.detectChanges();
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

    constructor(private cdr: ChangeDetectorRef) {
        Amplify.configure(outputs);
        this.initializeChartOptions();
    }

    private initializeChartOptions() {
        this.chartOptions = {
            autoSize: true,
            data: [],
            title: { text: ''},
            series: [
                {
                    type: 'bar',
                    xKey: 'ItemSKU',
                    yKey: 'AvailableQuantity',
                    yName: 'Available Quantity',
                    direction: 'horizontal',
                    cornerRadius: 10,
                    stacked: true,
                    label: { enabled: true, formatter: (params) => `${params.value} units` },
                },
                {
                    type: 'bar',
                    xKey: 'ItemSKU',
                    yKey: 'TotalPrice',
                    yName: 'Total Price',
                    direction: 'horizontal',
                    cornerRadius: 10,
                    stacked: true,
                    label: { enabled: true, formatter: (params) => `R${params.value.toFixed(2)}` },
                },
            ],
            axes: [
                {
                    type: 'category',
                    position: 'left',
                    title: { text: 'Item SKU' },
                },
                {
                    type: 'number',
                    position: 'bottom',
                    title: { text: 'Quantity and Price' },
                },
            ],
            // legend: { position: 'bottom' },
            // direction: 'horizontal'
        };

    }

    ngOnInit() {
        this.updateChart();
        console.log(this.data);
    }

    ngAfterViewInit() {
        this.setupThemeObserver();
        this.applyCurrentTheme();
    }

    ngOnDestroy() {
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
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
            attributes: true // Only observe attribute changes
        });
    }

    private applyCurrentTheme() {
        const theme = document.body.getAttribute('data-theme') === 'dark' ? this.darkTheme : this.lightTheme;
        this.chartOptions = {
            ...this.chartOptions, // Reapply chart options with new theme
            theme: theme
        };
        this.cdr.detectChanges(); // Ensure changes are detected
    }

    private generateChartData(rawData: any[]): any[] {
        const aggregatedData = rawData.reduce((acc, item) => {
            const existingItem = acc.find((i: { ItemSKU: any; }) => i.ItemSKU === item.ItemSKU);
            if (existingItem) {
                existingItem.AvailableQuantity += Number(item.AvailableQuantity) || 0;
                existingItem.TotalPrice += Number(item.TotalPrice) || 0;
            } else {
                acc.push({
                    ItemSKU: item.ItemSKU,
                    AvailableQuantity: Number(item.AvailableQuantity) || 0,
                    TotalPrice: Number(item.TotalPrice) || 0
                });
            }
            return acc;
        }, []);

        const processedData = aggregatedData.filter((item: { AvailableQuantity: number; TotalPrice: number; }) => item.AvailableQuantity > 0 && item.TotalPrice > 0);
        
        console.log('Processed data:', processedData);
        return processedData;
    }

    async loadSupplierQuotes() {
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
            // const tenantId = "1717667019559-j85syk";
            console.log('my id', tenantId);

            if (!tenantId) {
                console.error('TenantId not found in user attributes');
                // this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getSupplierQuotePrices',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const supplierData = JSON.parse(responseBody.body);
                console.log('Raw supplier data:', supplierData);
                this.data = this.generateChartData(supplierData);
                this.updateChart();
            } else {
                console.error('Error fetching inventory data:', responseBody.body);
                // this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
            // this.rowData = [];
        } finally {
            // this.isLoading = false;
        }
    }

    private updateChart() {
        if (this.data.length > 0) {
            console.log('Updating chart with data:', this.data);
            this.chartOptions = {
                ...this.chartOptions,
                data: this.data,
                title: {
                    text: this.chartTitle 
                }
            };
            this.cdr.detectChanges();
        } else {
            console.warn('No data available to display in the chart.');
        }
    }
}