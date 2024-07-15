import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Renderer2, ElementRef, AfterViewInit, Input, SimpleChanges } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';
import { MaterialModule } from '../../material/material.module';

type DataYearly = {
    [year: string]: { name: string; data: number[] }[];
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
    @Input() chartTitle?: string;
    public chartOptions: AgChartOptions;
    private themeObserver!: MutationObserver;

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


    updateChartData(year: string) {
        const seriesData = this.getDataByYear(year);

        this.chartOptions = {
            ...this.chartOptions,
            data: seriesData.flatMap((series) => series),
            title: {
                text: 'Sales vs. Sales Target Comparison',
            },
            series: [
                {
                    type: 'bar',
                    xKey: 'month',
                    yKey: 'Direct',
                    yName: 'Actual Sales',
                },
                {
                    type: 'bar',
                    xKey: 'month',
                    yKey: 'Target',
                    yName: 'Sales Target',
                },
            ],
            axes: [
                {
                    type: 'category',
                    position: 'bottom',
                    title: {
                        text: 'Month',
                    },
                },
                {
                    type: 'number',
                    position: 'left',
                    title: {
                        text: 'Sales Values',
                    },
                    label: {
                        formatter: ({ value }) => this.formatNumber(value),
                    },
                },
            ],
        };
    }

    formatNumber(value: number) {
        return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(value);
    }

    getSeriesDataByYear(year: string) {
        const data: DataYearly = {
            '2024': [
                { name: 'Direct', data: [450, 700, 600, 520, 810, 680, 720, 760, 500, 600, 850, 890] },
                { name: 'Target', data: [400, 680, 590, 500, 800, 670, 710, 750, 480, 590, 840, 880] },
            ],
            '2023': [
                { name: 'Direct', data: [400, 650, 550, 500, 750, 640, 700, 740, 480, 580, 830, 870] },
                { name: 'Target', data: [380, 630, 530, 480, 730, 620, 690, 730, 460, 560, 820, 860] },
            ],
            '2022': [
                { name: 'Direct', data: [350, 600, 500, 450, 700, 590, 650, 690, 430, 530, 780, 820] },
                { name: 'Target', data: [330, 580, 480, 430, 680, 570, 640, 680, 410, 510, 770, 810] },
            ],
            '2021': [
                { name: 'Direct', data: [300, 550, 450, 400, 650, 540, 600, 640, 380, 480, 730, 770] },
                { name: 'Target', data: [280, 530, 430, 380, 630, 520, 590, 630, 360, 460, 720, 760] },
            ],
        };
        return data[year] || data['2024']; // Fallback to 2024 if year is not found
    }

    getDataByYear(year: string) {
        const yearlyData = this.getSeriesDataByYear(year);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const combinedData = [];

        for (let i = 0; i < 12; i++) {
            combinedData.push({
                month: months[i],
                Direct: yearlyData[0].data[i], // Direct sales
                Target: yearlyData[1].data[i], // Sales target
            });
        }

        return combinedData;
    }

    constructor(private renderer: Renderer2, private el: ElementRef) {
        this.chartOptions = {};
        // this.initializeChart();
        this.setupThemeObserver();
    }

    ngOnInit() {
        this.updateChartData(this.selectedYear);
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
        this.updateChartData(this.selectedYear); // Re-render the chart with the new theme
    }
}
