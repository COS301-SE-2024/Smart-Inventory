import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCharts } from 'ag-charts-community';
import { MaterialModule } from '../../material/material.module';
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
export class DonutchartComponent {
    public selectedYear: string = new Date().getFullYear().toString(); // Default to current year
    public chartOptions: AgChartOptions;

    constructor() {
        this.chartOptions = {
            data: this.getData(),
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

    public getChartData(): AgCharts {
        return {
            data: this.getData(),
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
}
