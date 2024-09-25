import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import * as echarts from 'echarts';

@Component({
    selector: 'app-bubble-chart',
    standalone: true,
    imports: [],
    template: '<div #chartContainer style="width: 100%; height: 100%;"></div>',
    styles: [':host { display: block; width: 100%; height: 300px; }'],
})
export class BubbleChartComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() data: { name: string; value: [number, number, number, number] }[] = [];
    @Input() title: string = '';
    @ViewChild('chartContainer') chartContainer!: ElementRef;

    private chart: echarts.ECharts | null = null;
    private resizeObserver!: ResizeObserver;

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.initChart();
        this.observeResize();
    }

    private initChart(): void {
        if (this.chartContainer && this.chartContainer.nativeElement) {
            this.chart = echarts.init(this.chartContainer.nativeElement);
            this.updateChartOptions();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] || changes['title']) {
            this.updateChartOptions();
        }
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.chart) {
            this.chart.dispose();
        }
    }

    private observeResize(): void {
        this.resizeObserver = new ResizeObserver(() => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        if (this.chartContainer && this.chartContainer.nativeElement) {
            this.resizeObserver.observe(this.chartContainer.nativeElement);
        }
    }

    private updateChartOptions(): void {
        if (!this.chart) return;

        const options: echarts.EChartsOption = {
            title: {
                text: this.title,
                left: 'center',
            },
            tooltip: {
                formatter: (params: any) => {
                    const { name, value } = params.data;
                    return `Category: ${name}<br/>
                            Inventory Quantity: ${value[0]}<br/>
                            Avg Unit Cost: R${value[1].toFixed(2)}<br/>
                            Stock Requests: ${value[2]}<br/>
                            Unique Items: ${value[3]}`;
                },
            },
            xAxis: {
                type: 'value',
                name: 'Inventory Quantity',
                nameLocation: 'middle',
                nameGap: 30,
            },
            yAxis: {
                type: 'value',
                name: 'Average Unit Cost (R)',
                nameLocation: 'middle',
                nameGap: 30,
            },
            series: [
                {
                    type: 'scatter',
                    symbolSize: (data: number[]) => Math.sqrt(data[2]) * 2, // Adjust size scaling as needed
                    data: this.data,
                    label: {
                        show: true,
                        formatter: (params: any) => params.data.name,
                        position: 'top',
                    },
                    itemStyle: {
                        opacity: 0.8,
                    },
                },
            ],
        };

        this.chart.setOption(options);
    }
}
