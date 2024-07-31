import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';

@Component({
  selector: 'app-line',
  standalone: true,
  imports: [],
  templateUrl: './line.component.html',
  styleUrl: './line.component.css'
})
export class LineComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() title: string = '';
  @Input() xAxisData: string[] = [];
  @Input() yAxisName: string = '';
  @Input() seriesData: { name: string; data: number[] }[] = [];

  @ViewChild('chartContainer') chartContainer!: ElementRef;

  private chart: echarts.ECharts | null = null;

  ngOnInit() {
    // Chart initialization moved to ngAfterViewInit
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart) {
      if (changes['title'] || changes['xAxisData'] || changes['yAxisName'] || changes['seriesData']) {
        this.updateChartOptions();
      }
    }
  }

  private initChart() {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
      this.updateChartOptions();
    }
  }

  private updateChartOptions() {
    const options: EChartsOption = {
      title: {
        text: this.title
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: this.seriesData.map(series => series.name)
      },
      xAxis: {
        type: 'category',
        data: this.xAxisData
      },
      yAxis: {
        type: 'value',
        name: this.yAxisName
      },
      series: this.seriesData.map(series => ({
        name: series.name,
        type: 'line',
        data: series.data
      }))
    };

    if (this.chart) {
      this.chart.setOption(options);
    }
  }
}