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
