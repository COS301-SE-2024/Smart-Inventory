import { Component, OnDestroy, OnInit, AfterViewInit, SimpleChanges, Input, OnChanges } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCharts, AgChartTheme } from 'ag-charts-community';
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';
import { Amplify } from 'aws-amplify';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { OrdersService } from '../../../../../amplify/services/orders.service';

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
    private ordersData: any[] = [];
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
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const themeSettings = currentTheme === 'dark' ? this.darkTheme : this.lightTheme;
        
        this.chartOptions = {
            ...this.chartOptions,
            theme: themeSettings
        };

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

    constructor(private filterService: FilterService, private ordersService: OrdersService) {
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
                return;
            }
    
            // Use OrdersService to fetch orders
            const orders = await this.ordersService.getOrders(tenentId).toPromise();
    
            if (orders) {
                this.ordersData = orders.map((order: any) => ({
                    orderDate: order.Order_Date,
                    orderStatus: order.Order_Status,
                    deliveryDate: order.Expected_Delivery_Date,
                }));
                console.log('Processed orders:', this.ordersData);
            } else {
                console.error('Error fetching orders data');
                this.ordersData = [];
            }
        } catch (error) {
            console.error('Error in loadOrdersData:', error);
            this.ordersData = [];
        } finally {
            this.isLoading = false;
        }
    }

    private formatChartData() {
        const groupedData = this.ordersData.reduce((acc, cur) => {
            const [month, day, year] = cur.orderDate.split('-');
            const monthYear = `${year}-${month.padStart(2, '0')}`;

            acc[monthYear] = acc[monthYear] || { month: monthYear, completedCount: 0, pendingCount: 0, cancelledCount: 0 };

            if (cur.orderStatus === 'Completed') acc[monthYear].completedCount++;
            if (cur.orderStatus === 'Pending Approval') acc[monthYear].pendingCount++;
            if (cur.orderStatus === 'Cancelled') acc[monthYear].cancelledCount++;

            return acc;
        }, {});

        this.chartOptions = {
            title: {
                text: this.chartTitle || 'Requests and Shipment Duration',
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
        };

        this.applyCurrentTheme();
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
