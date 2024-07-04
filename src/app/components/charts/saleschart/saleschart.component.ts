import { Component, OnDestroy, OnInit } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCharts, AgChartTheme } from 'ag-charts-community';
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';

interface DataSet {
    categories: string[];
    salesData: number[];
    earningsData: number[];
    shipmentDuration: number[];
}

interface YearlyData {
    [key: string]: DataSet;
}

@Component({
    selector: 'app-saleschart',
    standalone: true,
    imports: [AgChartsAngular],
    templateUrl: './saleschart.component.html',
    styleUrl: './saleschart.component.css',
})
export class SaleschartComponent implements OnInit, OnDestroy {
    public chartOptions: AgChartOptions;
    private chart: any;
    private filterSubscription!: Subscription;
    private themeObserver!: MutationObserver;

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
                attributes: true // Configure observer to watch only attributes.
            });
        }

    private applyCurrentTheme() {
            const currentTheme = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            this.chartOptions = this.getChartOptions(currentTheme);
            if (this.chart) {
                AgCharts.update(this.chart, this.chartOptions);
            } else {
                this.chart = AgCharts.create(this.chartOptions);
            }
        }

    private getChartOptions(theme: string): AgChartOptions {
            const themeSettings = theme === 'dark' ? this.darkTheme : this.lightTheme;
            return {
                ...this.chartOptions, // spread existing settings to maintain other configurations
                theme: themeSettings
            };
        }

    private initializeChart() {
            this.chartOptions = this.getChartOptions(document.body.getAttribute('data-theme') || 'light');
            this.chart = AgCharts.create(this.chartOptions);
        }


    private yearlyData: YearlyData = {
            year: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                salesData: [23000, 25000, 22000, 27000, 24000, 26000, 25000, 23000, 21000, 22000, 24000, 25000],
                earningsData: [15000, 12000, 14000, 13000, 16000, 13000, 14000, 15000, 12000, 14000, 16000, 13000],
                shipmentDuration: [2, 3, 2.5, 3.2, 2.8, 2.1, 3.5, 3, 2.9, 3.1, 2.7, 3.6],
            },
            month: {
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                salesData: [12000, 18000, 16000, 13000],
                earningsData: [8000, 12000, 10000, 7000],
                shipmentDuration: [2.5, 2, 3, 3.2],
            },
            week: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                salesData: [3000, 3500, 4000, 4500, 3000, 2000, 2500],
                earningsData: [2000, 2500, 3000, 3500, 2000, 1500, 1750],
                shipmentDuration: [2, 2.1, 1.8, 1.9, 2.2, 2.5, 2.4],
            },
            day: {
                categories: ['00:00-04:00', '04:00-08:00', '08:00-12:00', '12:00-16:00', '16:00-20:00', '20:00-24:00'],
                salesData: [1500, 2000, 2500, 3000, 3500, 3000],
                earningsData: [1000, 1500, 2000, 2500, 3000, 2500],
                shipmentDuration: [1.5, 1.6, 1.4, 1.3, 1.5, 1.6],
            },
        };

        constructor(private filterService: FilterService) {
            this.setupThemeObserver();
            this.chartOptions = {
                theme: this.darkTheme,
                title: {
                    text: 'Sales and Shipment Duration',
                },
                data: this.getData(),
                series: [
                    {
                        type: 'area',
                        xKey: 'month',
                        yKey: 'sales',
                        yName: 'Sales',
                        stacked: true,
                    },
                    {
                        type: 'area',
                        xKey: 'month',
                        yKey: 'earnings',
                        yName: 'Earnings',
                        stacked: true,
                    },
                    {
                        type: 'area',
                        xKey: 'month',
                        yKey: 'shipmentDuration',
                        yName: 'Shipment Duration (days)',
                        marker: { enabled: true },
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
                    },
                ],
                // background: {
                //     fill: '#1E1E1E',
                // },
            };
            // this.chart = AgCharts.create(this.chartOptions);
            this.updateChartData('year');
        }

    getData() {
            return this.yearlyData['year'].categories.map((category, index) => ({
                month: category,
                sales: this.yearlyData['year'].salesData[index],
                earnings: this.yearlyData['year'].earningsData[index],
                shipmentDuration: this.yearlyData['year'].shipmentDuration[index],
            }));
        }

    ngOnInit() {
            this.filterSubscription = this.filterService.currentFilter.subscribe((filter) => {
                this.updateChartData(filter);
            });

            this.updateChartData('year');
        }

    ngOnDestroy() {
            if (this.filterSubscription) {
                this.filterSubscription.unsubscribe();
            }
            if (this.chart) {
                // AgCharts.destroy(this.chart); // Proper cleanup
            }
            if (this.themeObserver) {
                this.themeObserver.disconnect();
            }
        }

    private updateChartData(filter: string) {
            const data = this.yearlyData[filter];
            if (!data) return;

            const newOptions = {
                data: data.categories.map((category, index) => ({
                    category: category,
                    sales: data.salesData[index],
                    earnings: data.earningsData[index],
                })),
                axes: [
                    {
                        type: 'category',
                        position: 'bottom',
                        label: { rotation: 0 },
                        categories: data.categories,
                    },
                    {
                        type: 'number',
                        position: 'left',
                    },
                ],
            };

            if (this.chart) {
                AgCharts.update(this.chart, newOptions);
            } else {
                // this.chartOptions = {...this.chartOptions, ...newOptions};
                this.chart = AgCharts.create(this.chartOptions);
            }
        }
    }
