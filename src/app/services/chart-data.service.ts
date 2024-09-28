import { Injectable } from '@angular/core';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
var theme: AgChartTheme = {
    palette: {
        fills: ['#5C2983', '#0076C5', '#21B372', '#FDDE02', '#F76700', '#D30018'],
        strokes: ['gray'],
    },
    overrides: {
        common: {
            title: {
                fontSize: 18,
                color: 'black',
                fontFamily: 'sans-serif',
            },
            padding: {
                left: 20,
                right: 20,
            },
            axes: {
                category: {},
                number: {},
            },
        },
    },
};
@Injectable({
    providedIn: 'root',
})
export class ChartDataService {
    pieData!: AgChartOptions;

    constructor() {}

    setPieData(test: Map<string, number>, heading: string): AgChartOptions {
        return {
            theme: theme,
            title: {
                text: heading,
            },
            autoSize: true,
            data: Array.from(test.entries()).map(([asset, amount]) => ({ asset, amount })),
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

    setBarData(
        quantity: Map<string, number>,
        requests: Map<string, number>,
        requestsQuantity: Map<string, number>,
        heading: string,
    ): AgChartOptions {
        return {
            theme: theme,
            title: {
                text: heading,
            },
            autoSize: true,
            data: this.getData(quantity, requests, requestsQuantity),
            series: [
                {
                    type: 'bar',
                    xKey: 'category',
                    yKey: 'quantity',
                    yName: 'Quantity',
                },
                {
                    type: 'bar',
                    xKey: 'category',
                    yKey: 'requests',
                    yName: 'Requests',
                },
                {
                    type: 'bar',
                    xKey: 'category',
                    yKey: 'requestsQuantity',
                    yName: 'Requests Quantity',
                },
            ],
        };
    }

    setAreaData(heading: string): AgChartOptions {
        return {
            theme: theme,
            title: {
                text: heading,
            },
            autoSize: true,
            data: this.getAreaData(),
            series: [
                {
                    type: 'area',
                    xKey: 'month',
                    yKey: 'stock',
                    yName: 'Stock Level',
                },
                {
                    type: 'area',
                    xKey: 'month',
                    yKey: 'quantity',
                    yName: 'Quantity Requested',
                },
                {
                    type: 'area',
                    xKey: 'month',
                    yKey: 'requests',
                    yName: 'Requests',
                },
            ],
        };
    }

    getAreaData() {
        return [
            { month: 'Jan', stock: 222, quantity: 250, requests: 200 },
            { month: 'Feb', stock: 240, quantity: 255, requests: 210 },
            { month: 'Mar', stock: 280, quantity: 245, requests: 195 },
            { month: 'Apr', stock: 300, quantity: 260, requests: 205 },
            { month: 'May', stock: 350, quantity: 235, requests: 215 },
            { month: 'Jun', stock: 420, quantity: 270, requests: 200 },
            { month: 'Jul', stock: 300, quantity: 255, requests: 225 },
            { month: 'Aug', stock: 270, quantity: 305, requests: 210 },
            { month: 'Sep', stock: 260, quantity: 280, requests: 250 },
            { month: 'Oct', stock: 385, quantity: 250, requests: 205 },
            { month: 'Nov', stock: 320, quantity: 265, requests: 215 },
            { month: 'Dec', stock: 330, quantity: 255, requests: 220 },
        ];
    }

    getData(quantity: Map<string, number>, requests: Map<string, number>, requestsQuantity: Map<string, number>) {
        const data = [];
        for (const category of quantity.keys()) {
            data.push({
                category,
                quantity: quantity.get(category) || 0,
                requests: requests.get(category) || 0,
                requestsQuantity: requestsQuantity.get(category) || 0,
            });
        }
        return data;
    }
}
