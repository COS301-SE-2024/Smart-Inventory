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
  private resizeObserver!: ResizeObserver;
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  private chart: echarts.ECharts | null = null;

  ngOnInit() {
    // Chart initialization moved to ngAfterViewInit
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.observeResize();
  }

  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chart) {
        this.chart.resize();
      }
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
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

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.chart) {
      this.chart.dispose();
    }
  }

  private updateChartOptions(): void {
    const options: EChartsOption = {
      title: {
        text: this.title,
        left: 'center',
        top: '20px'
      },
      tooltip: { trigger: 'axis' },
      legend: {
        data: this.seriesData.map(series => series.name),
        bottom: 0 // Set the legend at the bottom of the chart
      },
      xAxis: {
        type: 'category',
        data: this.xAxisData
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '12%',
        top: '15%',
        containLabel: true
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
