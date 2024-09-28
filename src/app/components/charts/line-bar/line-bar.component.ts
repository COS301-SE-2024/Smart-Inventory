import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ElementRef,
    AfterViewInit,
    Input,
    SimpleChanges,
    OnChanges,
} from '@angular/core';
import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;
type ChartData = {
    source: any[];
};

@Component({
    selector: 'app-line-bar',
    standalone: true,
    imports: [],
    templateUrl: './line-bar.component.html',
    styleUrl: './line-bar.component.css',
})
export class LineBarComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
    @ViewChild('chartContainer') chartContainer!: ElementRef;
    private myChart!: echarts.ECharts;
    @Input() data!: ChartData;
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
        if (changes['data'] && !changes['data'].firstChange) {
            this.initChart();
        }
    }

    initChart(): void {
        if (this.chartContainer && this.data && this.data.source) {
            if (!this.myChart) {
                this.myChart = echarts.init(this.chartContainer.nativeElement);
            }

            const dataSource = this.data.source.slice(1); // Remove header row
            const skus = dataSource.map((item) => item[0]);
            const annualConsumptionValues = dataSource.map((item) => item[1]);
            const cumulativePercentages = dataSource.map((item) => parseFloat(item[2]));
            const categories = dataSource.map((item) => item[3]);

            const option: EChartsOption = {
                title: {
                    text: 'ABC Analysis',
                    left: 'center',
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                    },
                    formatter: function (params: any) {
                        const barData = params[0];
                        const lineData = params[1];
                        return `SKU: ${barData.name}<br/>
                    Annual Consumption Value: $${barData.value.toFixed(2)}<br/>
                    Cumulative Percentage: ${lineData.value.toFixed(2)}%<br/>
                    Category: ${categories[barData.dataIndex]}`;
                    },
                },
                legend: {
                    data: ['Annual Consumption Value', 'Cumulative Percentage'],
                    bottom: 0,
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    data: skus,
                    axisLabel: {
                        interval: 0,
                        rotate: 45,
                    },
                },
                yAxis: [
                    {
                        type: 'value',
                        name: 'Annual Consumption Value',
                        axisLabel: {
                            formatter: '${value}',
                        },
                    },
                    {
                        type: 'value',
                        name: 'Cumulative Percentage',
                        max: 100,
                        axisLabel: {
                            formatter: '{value}%',
                        },
                    },
                ],
                series: [
                    {
                        name: 'Annual Consumption Value',
                        type: 'bar',
                        data: annualConsumptionValues,
                        itemStyle: {
                            color: function (params: any) {
                                const category = categories[params.dataIndex];
                                if (category === 'A') return '#5470c6';
                                if (category === 'B') return '#91cc75';
                                return '#fac858';
                            },
                        },
                    },
                    {
                        name: 'Cumulative Percentage',
                        type: 'line',
                        yAxisIndex: 1,
                        data: cumulativePercentages,
                        smooth: true,
                        lineStyle: {
                            width: 3,
                            color: '#ee6666',
                        },
                        markLine: {
                            silent: true,
                            lineStyle: {
                                color: '#333',
                            },
                            data: [
                                { yAxis: 80, name: 'A (80%)' },
                                { yAxis: 95, name: 'B (95%)' },
                            ],
                        },
                    },
                ],
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
