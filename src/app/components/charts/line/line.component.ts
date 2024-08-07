import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts';

@Component({
  selector: 'app-line',
  standalone: true,
  imports: [],
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css']  // Corrected property name from 'styleUrl' to 'styleUrls'
})
export class LineComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() title: string = '';
  @Input() xAxisData: string[] = [];
  @Input() yAxisName: string = '';
  @Input() seriesData: { name: string; data: number[] }[] = []; // Adjusted for correct input

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  private chart: echarts.ECharts | null = null;

  @HostListener('window:resize')
  onWindowResize(): void {
    this.chart?.resize();
  }

  ngOnInit() {
    // Chart initialization moved to ngAfterViewInit
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart && (changes['title'] || changes['xAxisData'] || changes['yAxisName'] || changes['seriesData'])) {
      this.updateChartOptions();
    }
  }

  private initChart(): void {
    this.chart = echarts.init(this.chartContainer.nativeElement);
    this.updateChartOptions();
  }

  private updateChartOptions(): void {
    const options: EChartsOption = {
      title: { text: this.title },
      tooltip: { trigger: 'axis' },
      legend: {
        data: this.seriesData.map(series => series.name),
        bottom: 0 // Set the legend at the bottom of the chart
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
        type: 'bar',
        data: series.data,
        smooth: true
      }))
    };

    this.chart?.setOption(options);
  }
}
