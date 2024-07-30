import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;
@Component({
  selector: 'app-line-bar',
  standalone: true,
  imports: [],
  templateUrl: './line-bar.component.html',
  styleUrl: './line-bar.component.css'
})
export class LineBarComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private myChart!: echarts.ECharts;

  private extendedData = {
    source: [
      ["Metric", "2021", "2022", "2023", "2024", "2025", "2026"],
      ["Supplier S001 Total Spent", 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
      ["Supplier S002 Total Spent", 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
      ["Supplier S003 Total Spent", 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
      ["Supplier S004 Total Spent", 25.2, 37.1, 41.2, 18, 33.9, 49.1],
      ["Supplier S005 Total Spent", 62.2, 37.0, 18, 88.7, 49.1, 56.5],
    ]
  };

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  initChart(): void {
    if (this.chartContainer) {
      this.myChart = echarts.init(this.chartContainer.nativeElement);

      const option: EChartsOption = {
        legend: {},
        tooltip: {
          trigger: 'axis',
          showContent: false
        },
        dataset: this.extendedData,
        xAxis: { type: 'category' },
        yAxis: {},
        grid: { top: '55%' },
        series: [
          { type: 'line', smooth: true, seriesLayoutBy: 'row', emphasis: { focus: 'series' } },
          { type: 'line', smooth: true, seriesLayoutBy: 'row', emphasis: { focus: 'series' } },
          { type: 'line', smooth: true, seriesLayoutBy: 'row', emphasis: { focus: 'series' } },
          { type: 'line', smooth: true, seriesLayoutBy: 'row', emphasis: { focus: 'series' } },
          { type: 'line', smooth: true, seriesLayoutBy: 'row', emphasis: { focus: 'series' } },
          {
            type: 'pie', id: 'pie', radius: '30%', center: ['50%', '25%'], emphasis: { focus: 'self' },
            label: { formatter: '{b}: {@2021} ({d}%)' },
            encode: { itemName: 'Metric', value: '2021', tooltip: '2021' }
          }
        ]
      };

      this.myChart.setOption(option);

      this.myChart.on('updateAxisPointer', (event: any) => {
        const xAxisInfo = event.axesInfo[0];
        if (xAxisInfo) {
          const dimension = xAxisInfo.value + 1;
          this.myChart.setOption({
            series: {
              id: 'pie',
              label: { formatter: `{b}: {@[${dimension}]} ({d}%)` },
              encode: { value: dimension, tooltip: dimension }
            }
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.myChart != null) {
      this.myChart.dispose();
    }
  }

}
