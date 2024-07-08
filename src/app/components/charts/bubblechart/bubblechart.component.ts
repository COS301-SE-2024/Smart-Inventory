import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

@Component({
    selector: 'app-bubblechart',
    standalone: true,
    imports: [AgChartsAngular],
    templateUrl: './bubblechart.component.html',
    styleUrl: './bubblechart.component.css',
})

export class BubblechartComponent implements OnInit, OnDestroy, AfterViewInit  {
    public chartOptions: AgChartOptions;
    private themeObserver!: MutationObserver;
    
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

    constructor() {
        
        this.chartOptions = {
            data: [
                { category: 'Electronics', sales: 20000, target: 25000 },
                { category: 'Clothing', sales: 18000, target: 22000 },
                { category: 'Furniture', sales: 15000, target: 18000 },
                { category: 'Home Appliances', sales: 12000, target: 16000 },
                { category: 'Toys & Games', sales: 10000, target: 12000 },
            ],
            title: {
                text: 'Sales VS Target by Category',
            },
            series: [
                {
                    type: 'bar',
                    xKey: 'category',
                    yKey: 'sales',
                    yName: 'Actual Sales',
                    direction: 'horizontal',
                    cornerRadius: 10,
                    stacked: true,
                    label: { enabled: true, formatter: (params) => `${params.value}` },
                },
                {
                    type: 'bar',
                    xKey: 'category',
                    yKey: 'target',
                    yName: 'Sales Target',
                    direction: 'horizontal',
                    cornerRadius: 10,
                    stacked: true,
                    label: { enabled: true, formatter: (params) => `${params.value}` },
                },
            ],
            axes: [
                {
                    type: 'category',
                    position: 'left',
                    title: {
                        text: 'Product Category',
                    },
                },
                {
                    type: 'number',
                    position: 'bottom',
                    title: {
                        text: 'USD',
                    },
                },
            ],
        };
    }

    ngOnInit() {}

    ngAfterViewInit(){
        this.setupThemeObserver();
        this.applyCurrentTheme();
    }

    ngOnDestroy() {
        if (this.themeObserver) {
            this.themeObserver.disconnect();
        }
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
            ...this.chartOptions, // Reapply chart options with new theme
            theme: theme
        };
    }

    generateBubbleData(baseval: number, range: number, count: number, yrange: number, zrange: number) {
        const data = [];
        for (let i = 0; i < count; i++) {
            const x = Math.floor(Math.random() * range) + baseval + (i * range) / count; // Spread out inventory levels more
            const y = Math.floor(Math.random() * yrange) + 10 + (i * yrange) / count; // Spread out sales volume more
            const z = Math.floor(Math.random() * zrange) + 5; // Consistent bubble size distribution
            data.push({ x, y, z });
        }
        return data;
    }
}
