import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-stackedbarchart',
  standalone: true,
  imports: [],
  templateUrl: './stackedbarchart.component.html',
  styleUrl: './stackedbarchart.component.css'
})
export class StackedbarchartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: any[] = [];
  private chart: echarts.ECharts | null = null;
  private resizeObserver!: ResizeObserver;

  @ViewChild('chartContainer') private chartContainerRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.initChart();
    this.observeResize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
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

  private initChart(): void {
    if (this.chartContainerRef) {
      this.chart = echarts.init(this.chartContainerRef.nativeElement);
      this.updateChartOptions();
    }
  }

  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.resize();
      }
    });
    this.resizeObserver.observe(this.chartContainerRef.nativeElement);
  }

  private updateChartOptions(): void {
    if (!this.chart) return;

    const option: echarts.EChartsOption = {
      title: {
        text: 'Supplier Order Status Overview',
        left: 'center',
        top: '20px'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['Completed', 'In Progress', 'Delayed'],
        orient: 'horizontal',
        bottom: '10px',
        left: 'center'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.data.map(item => item.supplier)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: 'Completed',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: this.data.map(item => item.completed)
        },
        {
          name: 'In Progress',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: this.data.map(item => item.inProgress)
        },
        {
          name: 'Delayed',
          type: 'bar',
          stack: 'total',
          emphasis: { focus: 'series' },
          data: this.data.map(item => item.delayed)
        }
      ]
    };

    this.chart.setOption(option);
    // this.chart.resize();
  }
}