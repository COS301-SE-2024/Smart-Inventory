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

interface SeriesData {
    name: string;
    data: number[];
}

type ChartData = { categories: string[]; values: number[] } | { categories: string[]; series: SeriesData[] };

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [],
    template: '<div #chartContainer style="width: 100%; height: 100%;"></div>',
    styles: [':host { display: block; width: 100%; height: 300px; }'],
})
export class BarChartComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() data: ChartData = { categories: [], values: [] };
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
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
            },
            xAxis: {
                type: 'category',
                data: this.data.categories,
            },
            yAxis: {
                type: 'value',
            },
            series: this.getSeries(),
        };

        if ('series' in this.data) {
            options.legend = {
                data: this.data.series.map((s) => s.name),
                top: 'bottom',
            };
        }

        this.chart.setOption(options);
    }

    private getSeries(): echarts.SeriesOption[] {
        if ('values' in this.data) {
            // Single series data
            return [
                {
                    data: this.data.values,
                    type: 'bar',
                },
            ];
        } else if ('series' in this.data) {
            // Multi-series data
            return this.data.series.map((s) => ({
                name: s.name,
                data: s.data,
                type: 'bar',
            }));
        }
        return [];
    }
}
