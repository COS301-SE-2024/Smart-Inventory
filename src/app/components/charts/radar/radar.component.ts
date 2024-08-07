import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [],
  templateUrl: './radar.component.html',
  styleUrl: './radar.component.css'
})
export class RadarComponent implements OnInit, AfterViewInit {
  @Input() data: any[] = [];

  private chart: echarts.ECharts | null = null;

  constructor() { }

  ngOnInit(): void {
    // Initial setup if needed
  }

  ngAfterViewInit(): void {
    // this.initChart();
  }

  private initChart(): void {
    const element = document.querySelector('.echart-container') as HTMLElement;
    if (element) {
      this.chart = echarts.init(element);
      this.updateChartOptions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('New data received by RadarComponent:', this.data);
      this.initChart();
    }
  }

  private updateChartOptions(): void {
    if (!this.chart) return;
    console.log('radar data recieved:', this.data)
    const indicators = [
      { name: 'On Time Delivery', max: 1000 },
      { name: 'Order Accuracy', max: 100 },
      { name: 'Outstanding Payments', max: 10000 },
      { name: 'Total Spent', max: 500000 }
    ];

    const seriesData = this.data.map(supplier => ({
      value: [
        supplier['On Time Delivery Rate'],
        supplier['Order Accuracy Rate'],
        10000 - supplier['Out Standing Payments'], // Inverted scale for lower is better
        supplier['Total Spent']
      ],
      name: supplier['Supplier ID']
    }));

    const options: echarts.EChartsOption = {
      title: {
        text: 'Supplier Performance Overview'
      },
      tooltip: {},
      legend: {
        data: this.data.map(item => item['Supplier ID']),
        orient: 'vertical',
        left: 'right'
      },
      radar: {
        indicator: indicators,
        shape: 'circle',
        splitNumber: 5
      },
      series: this.data.map((supplier, index) => ({
        name: supplier['Supplier ID'],
        type: 'radar',
        symbol: 'none',
        lineStyle: {
          width: 3
        },
        areaStyle: {
          opacity: 0.3, // Adjust opacity to ensure series are visible but distinct
          color: this.getColor(index) // Function to get a color based on the index
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
    return colors[index % colors.length];  // Cycles through colors if there are more series than colors
  }
}