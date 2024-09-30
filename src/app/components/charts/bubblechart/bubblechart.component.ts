import { Component, OnDestroy, OnInit, AfterViewInit, SimpleChanges, Input, OnChanges, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;
type ChartData = {
    source: any[];
};
import outputs from '../../../../../amplify_outputs.json';
@Component({
    selector: 'app-bubblechart',
    standalone: true,
    imports: [],
    templateUrl: './bubblechart.component.html',
    styleUrl: './bubblechart.component.css',
})

export class BubblechartComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    @ViewChild('chartContainer') chartContainer!: ElementRef;
    private myChart!: echarts.ECharts;
    @Input() data!: ChartData;
    @Input() chartTitle: string = "";
    private resizeObserver!: ResizeObserver;

    constructor() {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.initChart();
        this.observeResize();
    }

    private observeResize(): void {
        this.resizeObserver = new ResizeObserver(() => {
            if (this.myChart) {
                this.myChart.resize();
            }
        });
        this.resizeObserver.observe(this.chartContainer.nativeElement);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ((changes['data'] && !changes['data'].firstChange) || changes['chartTitle']) {
            this.initChart();
        }
    }

    initChart(): void {
        if (this.chartContainer && this.data && this.data.source) {
            if (!this.myChart) {
                this.myChart = echarts.init(this.chartContainer.nativeElement);
            }

            const dataSource = this.data.source.slice(1); // Remove header row if present
            const itemSKUs = dataSource.map(item => item[0]);
            const availableQuantities = dataSource.map(item => item[1]);
            const totalPrices = dataSource.map(item => item[2]);

            const option: EChartsOption = {
                title: {
                    text: this.chartTitle,
                    left: 'center',
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['Available Quantity', 'Total Price'],
                    bottom: 0,
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'value',
                    name: 'Quantity and Price'
                },
                yAxis: {
                    type: 'category',
                    data: itemSKUs,
                    name: 'Item SKU',
                },
                series: [
                    {
                        name: 'Available Quantity',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true,
                            formatter: '{c} units'
                        },
                        data: availableQuantities
                    },
                    {
                        name: 'Total Price',
                        type: 'bar',
                        stack: 'total',
                        label: {
                            show: true,
                            formatter: 'R{c}'
                        },
                        data: totalPrices
                    }
                ]
            };

            this.myChart.setOption(option);
        }
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.myChart) {
            this.myChart.dispose();
        }
    }
}