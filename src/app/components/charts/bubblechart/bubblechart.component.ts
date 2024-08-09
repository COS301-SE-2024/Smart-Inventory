import { Component, OnDestroy, OnInit, AfterViewInit, SimpleChanges, Input, OnChanges } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgChartTheme } from 'ag-charts-community';

@Component({
    selector: 'app-bubblechart',
    standalone: true,
    imports: [AgChartsAngular],
    templateUrl: './bubblechart.component.html',
    styleUrl: './bubblechart.component.css',
})

export class BubblechartComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges  {
    public chartOptions!: AgChartOptions;
    private themeObserver!: MutationObserver;
    @Input() chartTitle: string = "Supplier Price and Availability Comparison";

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

    constructor() {

        this.initializeChart();
        
        // this.chartOptions = {
        //     data: [
        //         { category: 'Electronics', sales: 20000, target: 25000 },
        //         { category: 'Clothing', sales: 18000, target: 22000 },
        //         { category: 'Furniture', sales: 15000, target: 18000 },
        //         { category: 'Home Appliances', sales: 12000, target: 16000 },
        //         { category: 'Toys & Games', sales: 10000, target: 12000 },
        //     ],
        //     title: {
        //         text: 'Sales VS Target by Category',
        //     },
            // series: [
            //     {
            //         type: 'bar',
            //         xKey: 'category',
            //         yKey: 'sales',
            //         yName: 'Actual Sales',
            //         direction: 'horizontal',
            //         cornerRadius: 10,
            //         stacked: true,
            //         label: { enabled: true, formatter: (params) => `${params.value}` },
            //     },
            //     {
            //         type: 'bar',
            //         xKey: 'category',
            //         yKey: 'target',
            //         yName: 'Sales Target',
            //         direction: 'horizontal',
            //         cornerRadius: 10,
            //         stacked: true,
            //         label: { enabled: true, formatter: (params) => `${params.value}` },
            //     },
            // ],
            // axes: [
            //     {
            //         type: 'category',
            //         position: 'left',
            //         title: {
            //             text: 'Product Category',
            //         },
            //     },
            //     {
            //         type: 'number',
            //         position: 'bottom',
            //         title: {
            //             text: 'USD',
            //         },
            //     },
            // ],
        // };
    }

    private initializeChart() {
        this.chartOptions = {
            autoSize: true,
            data: this.generateChartData(),
            title: { text: this.chartTitle },
            series: [
                {
                    type: 'bar',
                    xKey: 'ItemSKU',
                    yKey: 'AvailableQuantity',
                    yName: 'Available Quantity',
                    direction: 'horizontal',
                    cornerRadius: 10,
                    stacked: true,
                    label: { enabled: true, formatter: (params) => `${params.value} units` },
                },
                {
                    type: 'bar',
                    xKey: 'ItemSKU',
                    yKey: 'TotalPrice',
                    yName: 'Total Price',
                    direction: 'horizontal',
                    cornerRadius: 10,
                    stacked: true,
                    label: { enabled: true, formatter: (params) => `$${params.value.toFixed(2)}` },
                },
            ],
            axes: [
                {
                    type: 'category',
                    position: 'left',
                    title: { text: 'Item SKU' },
                },
                {
                    type: 'number',
                    position: 'bottom',
                    title: { text: 'Quantity and Price' },
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

    private generateChartData() {
        // Sample Data Processing, replace this with actual data fetching and processing logic
        return [
            { ItemSKU: 'MS-301', AvailableQuantity: 500, TotalPrice: 285 },
            { ItemSKU: 'AM-405', AvailableQuantity: 600, TotalPrice: 360 },
            { ItemSKU: 'BF-001', AvailableQuantity: 300, TotalPrice: 334.08 },
            { ItemSKU: 'CH-205', AvailableQuantity: 200, TotalPrice: 109.98 },
            { ItemSKU: 'RO-102', AvailableQuantity: 400, TotalPrice: 391.5 },
        ];
    }
}
