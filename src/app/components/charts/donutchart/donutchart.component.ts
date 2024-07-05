import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCharts, AgChartTheme } from 'ag-charts-community';
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
export class DonutchartComponent implements AfterViewInit{
    public selectedYear: string = new Date().getFullYear().toString(); // Default to current year
    public chartOptions: AgChartOptions;
    private themeObserver!: MutationObserver;

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
        this.setupThemeObserver();
        this.applyCurrentTheme();
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
                    paddingX: 16, // Optional: Adjusts the horizontal padding of the legend items
                    paddingY: 5, // Optional: Adjusts the vertical padding of the legend items
                },
            },
        };
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
                    paddingX: 16, // Optional: Adjusts the horizontal padding of the legend items
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
    
    ngAfterViewInit(): void {
        this.applyCurrentTheme();  // Apply the initial theme based on the current setting
    }
}
