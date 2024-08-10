import { Component, OnDestroy, OnInit, AfterViewInit, SimpleChanges, Input, OnChanges } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCharts, AgChartTheme } from 'ag-charts-community';
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';
import { Amplify } from 'aws-amplify';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';

import outputs from '../../../../../amplify_outputs.json';
interface DataSet {
    categories: string[];
    salesData: number[];
    earningsData: number[];
    shipmentDuration: number[];
}

@Component({
    selector: 'app-saleschart',
    standalone: true,
    imports: [AgChartsAngular],
    templateUrl: './saleschart.component.html',
    styleUrl: './saleschart.component.css',
})
export class SaleschartComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    public chartOptions!: AgChartOptions;
    private chart: any;
    private filterSubscription!: Subscription;
    private themeObserver!: MutationObserver;
    private rowData: any[] = [];
    @Input() chartTitle?: string;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['chartTitle']) {
            // Code to update the chart's title, perhaps by redrawing the chart
        }
    }

    private lightTheme: AgChartTheme = {
        palette: {
            fills: ["#5C2983", "#0076C5", "#21B372"], // Light theme colors
            strokes: ["gray"],
        },
        baseTheme: 'ag-default', // ag-Grid provided default theme
    };

    private darkTheme: AgChartTheme = {
        palette: {
            fills: ["#8860D0", "#4098D7", "#56CF87"], // Dark theme colors
            strokes: ["#aaaaaa"],
        },
        baseTheme: 'ag-material-dark', // ag-Grid provided dark theme
        overrides: {
            common: {
                background: {
                    fill: '#1E1E1E' // Setting dark theme specific background color
                }
            }
        }
    };

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
        // Retrieve the theme setting directly from the body attribute
        const currentTheme = document.body.getAttribute('data-theme') || 'light'; // Default to 'light' if undefined
        this.chartOptions = this.getChartOptions(currentTheme);
        if (this.chart) {
            AgCharts.update(this.chart, this.chartOptions);
        } else {
            this.chart = AgCharts.create(this.chartOptions);
        }
    }


    private getChartOptions(theme: string): AgChartOptions {
        // Determine the theme settings based on the passed theme string
        const themeSettings = theme === 'dark' ? this.darkTheme : this.lightTheme;
        return {
            ...this.chartOptions, // Use spread to maintain any existing configurations
            theme: themeSettings  // Apply the determined theme settings
        };
    }

    private ordersData: any[] = [
        // { orderDate: '8/7/2024', orderStatus: 'Completed', deliveryDate: '8/7/2024' },
        // { orderDate: '8/7/2024', orderStatus: 'Pending Approval', deliveryDate: null },
        // { orderDate: '8/5/2024', orderStatus: 'Completed', deliveryDate: '8/7/2024' },
        // { orderDate: '8/3/2024', orderStatus: 'Completed', deliveryDate: '8/4/2024' },
        // { orderDate: '8/1/2024', orderStatus: 'Cancelled', deliveryDate: null },
        // { orderDate: '7/30/2024', orderStatus: 'Completed', deliveryDate: '8/1/2024' },
        // { orderDate: '7/28/2024', orderStatus: 'Pending Approval', deliveryDate: null },
        // { orderDate: '7/25/2024', orderStatus: 'Completed', deliveryDate: '7/27/2024' },
        // { orderDate: '7/23/2024', orderStatus: 'Completed', deliveryDate: '7/25/2024' },
        // { orderDate: '7/21/2024', orderStatus: 'Cancelled', deliveryDate: null },
        // { orderDate: '6/15/2024', orderStatus: 'Completed', deliveryDate: '6/17/2024' },
        // { orderDate: '6/12/2024', orderStatus: 'Pending Approval', deliveryDate: null },
        // { orderDate: '6/10/2024', orderStatus: 'Completed', deliveryDate: '6/11/2024' },
        // { orderDate: '5/29/2024', orderStatus: 'Completed', deliveryDate: '5/30/2024' },
        // { orderDate: '5/20/2024', orderStatus: 'Cancelled', deliveryDate: null },
        // { orderDate: '5/15/2024', orderStatus: 'Completed', deliveryDate: '5/17/2024' },
        // { orderDate: '5/10/2024', orderStatus: 'Pending Approval', deliveryDate: null },
        // { orderDate: '4/25/2024', orderStatus: 'Completed', deliveryDate: '4/27/2024' },
        // { orderDate: '4/20/2024', orderStatus: 'Completed', deliveryDate: '4/21/2024' },
        // { orderDate: '4/15/2024', orderStatus: 'Cancelled', deliveryDate: null },
    ];

    constructor(private filterService: FilterService) {
        Amplify.configure(outputs);
        this.setupThemeObserver();
        // this.chartOptions = {
        //     theme: this.darkTheme,
        //     title: {
        //         text: 'Sales and Shipment Duration',
        //     },
        //     data: this.formatChartData(),
        //     series: [
        //         {
        //             type: 'area',
        //             xKey: 'month',
        //             yKey: 'completedCount',
        //             yName: 'Completed Orders',
        //             stacked: true,
        //         },
        //         {
        //             type: 'area',
        //             xKey: 'month',
        //             yKey: 'pendingCount',
        //             yName: 'Pending Orders',
        //             stacked: true,
        //         },
        //         {
        //             type: 'area',
        //             xKey: 'month',
        //             yKey: 'cancelledCount',
        //             yName: 'Cancelled Orders',
        //             stacked: true,
        //         },
        //     ],
        //     axes: [
        //         {
        //             type: 'category',
        //             position: 'bottom',
        //         },
        //         {
        //             type: 'number',
        //             position: 'left',
        //             title: {
        //                 text: 'Number of Orders',
        //             },
        //             max: 10,
        //         },
        //     ],
        //     // background: {
        //     //     fill: '#1E1E1E',
        //     // },
        // };
        // this.chart = AgCharts.create(this.chartOptions);
        // this.updateChartData('year');
    }

    private isLoading = false;

    async loadOrdersData() {
        this.isLoading = true;
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

            if (!tenentId) {
                console.error('TenentId not found in user attributes');
                this.rowData = [];
                return;
            }

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getOrders',
                Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Response from Lambda:', responseBody);

            if (responseBody.statusCode === 200) {
                const orders = JSON.parse(responseBody.body);
                this.ordersData = orders.map((order: any) => ({
                    // Order_ID: order.Order_ID,
                    orderDate: order.Order_Date,
                    orderStatus: order.Order_Status,
                    // Quote_ID: order.Quote_ID,
                    // Quote_Status: order.Quote_Status,
                    // Selected_Supplier: order.Selected_Supplier,
                    deliveryDate: order.Expected_Delivery_Date,
                    // Actual_Delivery_Date: order.Actual_Delivery_Date,
                    // Creation_Time: order.Creation_Time // Add this line
                }));
                console.log('Processed orders:', this.ordersData);
                this.ordersData.push(
                    { orderDate: '8-7-2024', orderStatus: 'Completed', deliveryDate: '8/7/2024' },
                    { orderDate: '8-7-2024', orderStatus: 'Pending Approval', deliveryDate: null },
                    { orderDate: '8-5-2024', orderStatus: 'Completed', deliveryDate: '8/7/2024' },
                    { orderDate: '8-3-2024', orderStatus: 'Completed', deliveryDate: '8/4/2024' },
                    { orderDate: '8-1-2024', orderStatus: 'Cancelled', deliveryDate: null },
                    { orderDate: '7-30-2024', orderStatus: 'Completed', deliveryDate: '8/1/2024' },
                    { orderDate: '7-28-2024', orderStatus: 'Pending Approval', deliveryDate: null },
                    { orderDate: '7-25-2024', orderStatus: 'Completed', deliveryDate: '7/27/2024' },
                    { orderDate: '7-23-2024', orderStatus: 'Completed', deliveryDate: '7/25/2024' },
                    { orderDate: '7-21-2024', orderStatus: 'Cancelled', deliveryDate: null },
                    { orderDate: '6-15-2024', orderStatus: 'Completed', deliveryDate: '6/17/2024' },
                    { orderDate: '6-12-2024', orderStatus: 'Pending Approval', deliveryDate: null },
                    { orderDate: '6-10-2024', orderStatus: 'Completed', deliveryDate: '6/11/2024' },
                    { orderDate: '5-29-2024', orderStatus: 'Completed', deliveryDate: '5/30/2024' },
                    { orderDate: '5-20-2024', orderStatus: 'Cancelled', deliveryDate: null },
                    { orderDate: '5-15-2024', orderStatus: 'Completed', deliveryDate: '5/17/2024' },
                    { orderDate: '5-10-2024', orderStatus: 'Pending Approval', deliveryDate: null },
                    { orderDate: '4-25-2024', orderStatus: 'Completed', deliveryDate: '4/27/2024' },
                    { orderDate: '4-20-2024', orderStatus: 'Completed', deliveryDate: '4/21/2024' },
                    { orderDate: '4-15-2024', orderStatus: 'Cancelled', deliveryDate: null },
                );
            } else {
                console.error('Error fetching orders data:', responseBody.body);
                this.rowData = [];
            }
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
        }
    }

    private formatChartData() {
        // Group data by month and aggregate counts by order status
        const groupedData = this.ordersData.reduce((acc, cur) => {
            const [month, day, year] = cur.orderDate.split('-');
            const monthYear = `${year}-${month.padStart(2, '0')}`; // Format as YYYY-MM

            acc[monthYear] = acc[monthYear] || { month: monthYear, completedCount: 0, pendingCount: 0, cancelledCount: 0 };

            if (cur.orderStatus === 'Completed') acc[monthYear].completedCount++;
            if (cur.orderStatus === 'Pending Approval') acc[monthYear].pendingCount++;
            if (cur.orderStatus === 'Cancelled') acc[monthYear].cancelledCount++;

            return acc;
        }, {});

        console.log('my object groupedData',  Object.values(groupedData))

        this.chartOptions = {
            // theme: this.darkTheme,
            title: {
                text: 'Sales and Shipment Duration',
            },
            data: Object.values(groupedData),
            series: [
                {
                    type: 'area',
                    xKey: 'month',
                    yKey: 'completedCount',
                    yName: 'Completed Orders',
                    stacked: true,
                },
                {
                    type: 'area',
                    xKey: 'month',
                    yKey: 'pendingCount',
                    yName: 'Pending Orders',
                    stacked: true,
                },
                {
                    type: 'area',
                    xKey: 'month',
                    yKey: 'cancelledCount',
                    yName: 'Cancelled Orders',
                    stacked: true,
                },
            ],
            axes: [
                {
                    type: 'category',
                    position: 'bottom',
                },
                {
                    type: 'number',
                    position: 'left',
                    title: {
                        text: 'Number of Orders',
                    },
                    max: 10,
                },
            ],
            // background: {
            //     fill: '#1E1E1E',
            // },
        };
        
    }


    async ngOnInit() {
        this.applyCurrentTheme(); // Set the theme when the component loads
        this.filterSubscription = this.filterService.currentFilter.subscribe((filter) => {
            // this.updateChartData(filter);
        });

        // this.updateChartData('year');
        await this.loadOrdersData();
        this.formatChartData();
    }

    ngAfterViewInit() {
        // Ensure the theme is applied after the view initializes, catching any late DOM updates
        this.applyCurrentTheme();
    }

    ngOnDestroy() {
        if (this.filterSubscription) {
            this.filterSubscription.unsubscribe();
        }
        if (this.chart) {
            this.chart = null; // Proper cleanup
        }
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
    }

}
