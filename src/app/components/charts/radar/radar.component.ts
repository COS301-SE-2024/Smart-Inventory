import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [],
  templateUrl: './radar.component.html',
  styleUrl: './radar.component.css'
})
export class RadarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() data: any[] = [];
  @ViewChild('chartContainer') chartContainer!: ElementRef;

  private chart: echarts.ECharts | null = null;
  private resizeObserver!: ResizeObserver;

  constructor() { }

  ngOnInit(): void {
    // Initial setup if needed
  }

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
    if (changes['data']) {
      console.log('New data received by RadarComponent:', this.data);
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
    console.log('radar data received:', this.data)
    const indicators = [
      { name: 'On Time Delivery(%)', max: 100 },
      { name: 'Order Accuracy(%)', max: 100 },
      { name: 'Outstanding Payments', max: 10000 },
      { name: 'Total Spent', max: 1000000 }
    ];

    const options: echarts.EChartsOption = {
      title: {
        text: 'Supplier Performance Overview',
        left: 'center',
        top: '5%'
      },
      tooltip: {},
      legend: {
        data: this.data.map(item => item['Supplier ID']),
        orient: 'horizontal',
        left: 'center',
        bottom: '5%'
      },
      radar: {
        indicator: indicators,
        shape: 'circle',
        splitNumber: 5,
        center: ['50%', '50%'],
        radius: '60%'
      },
      series: this.data.map((supplier, index) => ({
        name: supplier['Supplier ID'],
        type: 'radar',
        symbol: 'none',
        lineStyle: {
          width: 3
        },
        areaStyle: {
          opacity: 0.3,
          color: this.getColor(index)
        },
        data: [
          {
            value: [
              supplier['On Time Delivery Rate'],
              supplier['Order Accuracy Rate'],
              10000 - supplier['Out Standing Payments'],
              supplier['Total Spent']
            ],
            name: supplier['Supplier ID']
          }
        ]
      }))
    };

    this.chart.setOption(options);
  }

  private getColor(index: number): string {
    const colors = ['#5470C6', '#91CC75', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#ea7ccc'];
    return colors[index % colors.length];
  }
}