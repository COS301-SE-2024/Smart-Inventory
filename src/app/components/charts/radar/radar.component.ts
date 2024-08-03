import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
@Component({
  selector: 'app-radar',
  standalone: true,
  imports: [],
  templateUrl: './radar.component.html',
  styleUrl: './radar.component.css'
})
export class RadarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;
  private chartInstance: echarts.ECharts | null = null;

  constructor() { }

  ngOnInit(): void {
    // ngOnInit remains empty as DOM access here would lead to undefined errors
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  initChart(): void {
    this.chartInstance = echarts.init(this.chartContainer.nativeElement, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    this.setChartOptions();
  }

  setChartOptions(): void {
    const option: echarts.EChartsOption = {
      title: {
        text: 'Basic Radar Chart'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: ['Supplier S001', 'Supplier S002']
      },
      radar: {
        shape: 'circle',
        indicator: [
          { name: 'On Time Delivery Rate', max: 100 },
          { name: 'Order Accuracy Rate', max: 100 },
          { name: 'RiskScore', max: 10 },
          { name: 'Out Standing Payments', max: 10000 },
          { name: 'TotalSpent', max: 200000 }
        ]
      },
      series: [
        {
          name: 'Supplier Performance',
          type: 'radar',
          areaStyle: {},
          data: [
            {
              value: [95, 99.5, 1, 1000, 150000], // Example values for Supplier S001
              name: 'Supplier S001'
            },
            {
              value: [91, 97.5, 5, 3800, 125000], // Example values for Supplier S002
              name: 'Supplier S002'
            }
          ]
        }
      ]
    };

    this.chartInstance?.setOption(option);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.chartInstance) {
      this.chartInstance.resize();
    }
  }
}
