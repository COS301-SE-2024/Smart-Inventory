import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCharts, AgChartTheme } from 'ag-charts-community';
import { MaterialModule } from '../../material/material.module';
import { Amplify } from 'aws-amplify';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';

import outputs from '../../../../../amplify_outputs.json';

@Component({
    selector: 'app-donutchart',
    standalone: true,
    imports: [FormsModule, MaterialModule, AgChartsAngular],
    templateUrl: './donutchart.component.html',
    styleUrl: './donutchart.component.css',
})
export class DonutchartComponent implements AfterViewInit, OnInit, OnDestroy {
    public selectedYear: string = new Date().getFullYear().toString();
    public chartOptions: AgChartOptions;
    private themeObserver!: MutationObserver;
    private data: any[] = [];
    private chart: any;

    private lightTheme: AgChartTheme = {
        palette: {
            fills: ['#5C2983', '#0076C5', '#21B372'],
            strokes: ['#333333']
        },
        baseTheme: 'ag-default',
    };
    
    private darkTheme: AgChartTheme = {
        palette: {
            fills: ['#8860D0', '#4098D7', '#56CF87'],
            strokes: ['#aaaaaa']
        },
        baseTheme: 'ag-material-dark',
        overrides: {
            common: {
                background: {
                    fill: '#1E1E1E'
                },
                title: {
                    color: '#ffffff'
                },
                legend: {
                    item: {
                        label: {
                            color: '#ffffff'
                        }
                    }
                }
            },
        }
    };    

    constructor() {
        Amplify.configure(outputs);
        // Initialize chartOptions with default values
        this.chartOptions = this.getDefaultChartOptions();
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
            attributes: true
        });
    }

    private applyCurrentTheme() {
        const isDarkTheme = document.body.getAttribute('data-theme') === 'dark';
        const theme = isDarkTheme ? this.darkTheme : this.lightTheme;
        
        if (this.chart) {
            this.chart.updateTheme(theme);
        } else {
            this.chartOptions = {
                ...this.chartOptions,
                theme: theme
            };
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

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'Inventory-getItems',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 200) {
                const inventoryItems = JSON.parse(responseBody.body);
                this.updateChartDataFromInventory(inventoryItems);
            } else {
                console.error('Error fetching inventory data:', responseBody.body);
            }
        } catch (error) {
            console.error('Error in loadInventoryData:', error);
        }
    }

    updateChartDataFromInventory(inventoryItems: any[]) {
        const aggregatedData = inventoryItems.reduce((acc, item) => {
            const { category, quantity } = item;
            acc[category] = (acc[category] || 0) + quantity;
            return acc;
        }, {});
    
        this.data = Object.keys(aggregatedData).map(category => ({
            asset: category,
            amount: aggregatedData[category]
        }));
        this.updateChartOptions();
    }

    private updateChartOptions() {
        this.chartOptions = {
            ...this.getDefaultChartOptions(),
            data: this.data
        };
        this.applyCurrentTheme();
    }

    private getDefaultChartOptions(): AgChartOptions {
        return {
            data: [],
            title: {
                text: 'Inventory Composition by Category',
            },
            series: [
                {
                    type: 'donut',
                    calloutLabelKey: 'asset',
                    angleKey: 'amount',
                    innerRadiusRatio: 0.5,
                },
            ],
            legend: {
                position: 'right',
                item: {
                    marker: {
                        strokeWidth: 0,
                    },
                    paddingX: 5,
                    paddingY: 5,
                },
            },
        };
    }

    async ngOnInit() {
        this.setupThemeObserver();
        await this.loadInventoryData();
    }

    ngAfterViewInit() {
        this.applyCurrentTheme();
    }

    ngOnDestroy() {
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
    }

    onChartReady(chart: any) {
        this.chart = chart;
        this.applyCurrentTheme();
    }
}