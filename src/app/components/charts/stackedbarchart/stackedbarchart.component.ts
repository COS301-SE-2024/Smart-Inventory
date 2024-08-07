import { Component, Input, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-stackedbarchart',
  standalone: true,
  imports: [],
  templateUrl: './stackedbarchart.component.html',
  styleUrl: './stackedbarchart.component.css'
})
export class StackedbarchartComponent implements OnChanges, AfterViewInit {
  @Input() data: any[] = [];
  private chart: echarts.ECharts | null = null;

  @ViewChild('chartContainer') private chartContainerRef: ElementRef<HTMLDivElement> | undefined;

  constructor() { }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      console.log('New data received:', this.data);
      this.updateChartOptions();
    }
  }

  private initChart(): void {
    if (this.chartContainerRef) {
      this.chart = echarts.init(this.chartContainerRef.nativeElement);
      this.updateChartOptions();
    }
  }

  private updateChartOptions(): void {
    if (!this.chart) return;

    const option: echarts.EChartsOption = {
      title: { text: 'Overall status progression' },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Completed', 'In Progress', 'Delayed']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: this.data.map(item => item.supplier)
      },
      series: [
        {
          name: 'Completed',
          type: 'bar',
          stack: 'total',
          data: this.data.map(item => item.completed)
        },
        {
          name: 'In Progress',
          type: 'bar',
          stack: 'total',
          data: this.data.map(item => item.inProgress)
        },
        {
          name: 'Delayed',
          type: 'bar',
          stack: 'total',
          data: this.data.map(item => item.delayed)
        }
      ]
    };

    this.chart.setOption(option);
  }
}