import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCharts, AgChartTheme } from 'ag-charts-community';
import { MaterialModule } from '../../material/material.module';
import { Amplify } from 'aws-amplify';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';

import outputs from '../../../../../amplify_outputs.json';
export interface ChartOptions {
    data: any[];
    series: any[];
}

type YearlyData = {
    [key: string]: number[];
};

@Component({
    selector: 'app-donutchart',
    standalone: true,
    imports: [FormsModule, MaterialModule, AgChartsAngular],
    templateUrl: './donutchart.component.html',
    styleUrl: './donutchart.component.css',
})
export class DonutchartComponent implements AfterViewInit, OnInit{
    public selectedYear: string = new Date().getFullYear().toString(); // Default to current year
    public chartOptions!: AgChartOptions;
    private themeObserver!: MutationObserver;
    private data: any[] = [];
    private chart: any;
    private lightTheme: AgChartTheme = {
        palette: {
            fills: ['#5C2983', '#0076C5', '#21B372'],  // Example fill colors for light theme
            strokes: ['#333333']                       // Example stroke color for light theme
        },
        baseTheme: 'ag-default',                      // Use the default theme as a base for light theme
    };
    
    private darkTheme: AgChartTheme = {
        palette: {
            fills: ['#8860D0', '#4098D7', '#56CF87'],  // Example fill colors for dark theme
            strokes: ['#aaaaaa']                       // Example stroke color for dark theme
        },
        baseTheme: 'ag-material-dark',                // Use the material dark theme as a base for dark theme
        overrides: {
            common: {
                background: {
                    fill: '#1E1E1E'                   // Dark background color specifically for dark theme
                },
                title: {
                    color: '#ffffff'                  // Ensuring title color is white in dark mode
                },
                legend: {
                    item: {
                        label: {
                            color: '#ffffff'          // Ensuring legend text is white in dark mode
                        }
                    }
                }
            },
        }
    };    

    constructor() {
        Amplify.configure(outputs);
        this.setupThemeObserver();
        this.applyCurrentTheme();
        // this.chartOptions = {
        //     data: this.getData(),
        //     title: {
        //         text: 'Inventory Composition by Category',
        //     },
        //     series: [
        //         {
        //             type: 'donut',
        //             calloutLabelKey: 'asset',
        //             angleKey: 'amount',
        //             innerRadiusRatio: 0.5,
        //         },
        //     ],
        //     legend: {
        //         position: 'right', // Positions the legend to the right
        //         item: {
        //             marker: {
        //                 strokeWidth: 0, // Optional: Adjusts the marker stroke width if needed
        //             },
        //             paddingX: 5, // Optional: Adjusts the horizontal padding of the legend items
        //             paddingY: 5, // Optional: Adjusts the vertical padding of the legend items
        //         },
        //     },
        // };
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
            ...this.getChartData(), // Ensure existing configurations are preserved
            theme: theme
        };
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
                // this.rowData = [];
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
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const inventoryItems = JSON.parse(responseBody.body);
                // this.data = inventoryItems;
                this.updateChartDataFromInventory(inventoryItems);
                // console.log('Processed inventory items donut:', inventoryItems);
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

    updateChartDataFromInventory(inventoryItems: any[]) {
        const aggregatedData = inventoryItems.reduce((acc, item) => {
            const { category, quantity } = item;
            acc[category] = (acc[category] || 0) + quantity;
            return acc;
        }, {});
    
        const chartData = Object.keys(aggregatedData).map(category => ({
            asset: category,
            amount: aggregatedData[category]
        }));
        this.data = chartData;
        this.chartOptions = {
            data: chartData,
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
                position: 'right', // Positions the legend to the right
                item: {
                    marker: {
                        strokeWidth: 0, // Optional: Adjusts the marker stroke width if needed
                    },
                    paddingX: 5, // Optional: Adjusts the horizontal padding of the legend items
                    paddingY: 5, // Optional: Adjusts the vertical padding of the legend items
                },
            },
        };
        // AgCharts.update(this.chart, this.chartOptions);
    }
    

    public getChartData(): AgCharts {
        return {
            data: this.data,
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
                position: 'right', // Positions the legend to the right
                item: {
                    marker: {
                        strokeWidth: 0, // Optional: Adjusts the marker stroke width if needed
                    },
                    paddingX: 5, // Optional: Adjusts the horizontal padding of the legend items
                    paddingY: 5, // Optional: Adjusts the vertical padding of the legend items
                },
            },
        };
    }

    getData() {
        return [
            { asset: 'Electronics', amount: 50000 },
            { asset: 'Clothing', amount: 35000 },
            { asset: 'Furniture', amount: 25000 },
            { asset: 'Home Appliances', amount: 15000 },
            { asset: 'Toys & Games', amount: 10000 },
        ];
    }

    updateChartData(year: string) {
        this.chartOptions = this.getChartData();
        console.log(this.chartOptions); // Check what is being set
    }
    
    async ngAfterViewInit() {
        this.applyCurrentTheme();  // Apply the initial theme based on the current setting
        await this.loadInventoryData();
    }

    async ngOnInit() {
        // await this.loadInventoryData();
    }
}
