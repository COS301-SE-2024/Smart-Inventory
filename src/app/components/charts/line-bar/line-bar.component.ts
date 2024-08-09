import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;
type ChartData = {
  source: any[];
};

@Component({
  selector: 'app-line-bar',
  standalone: true,
  imports: [],
  templateUrl: './line-bar.component.html',
  styleUrl: './line-bar.component.css'
})
export class LineBarComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private myChart!: echarts.ECharts;
  @Input() data!: ChartData; // Input property to accept data

  // private extendedData = {
  //   source: [
  //     ["Metric", "2021", "2022", "2023", "2024", "2025", "2026"],
  //     ["Supplier S001 Total Spent", 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
  //     ["Supplier S002 Total Spent", 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
  //     ["Supplier S003 Total Spent", 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
  //     ["Supplier S004 Total Spent", 25.2, 37.1, 41.2, 18, 33.9, 49.1],
  //     ["Supplier S005 Total Spent", 62.2, 37.0, 18, 88.7, 49.1, 56.5],
  //   ]
  // };

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange) {
      // console.log('tf: ', this.data);
      this.initChart();  // Re-initialize the chart when input data changes
    }
  }

  initChart(): void {
    if (this.chartContainer && this.data && this.data.source) {
      this.myChart = echarts.init(this.chartContainer.nativeElement);

      const dataSource = this.data.source;

      const option: EChartsOption = {
        title: { text: 'Total amount spent over periods' },
        tooltip: {
          trigger: 'axis',
          showContent: false
        },
        legend: {},
        dataset: {
          source: dataSource
        },
        xAxis: { type: 'category' },
        yAxis: {},
        grid: { top: '55%' },
        series: [
          ...dataSource.slice(1).map(() => ({
            type: 'line',
            smooth: true,
            seriesLayoutBy: 'row',
            emphasis: { focus: 'series' }
          })),
          {
            type: 'pie',
            id: 'pie',
            radius: '30%',
            center: ['50%', '25%'],
            emphasis: { focus: 'self' },
            label: {
              // Ensure the formatter uses the correct data and field names
              formatter: '{b}: {@2021} ({d}%)'
            },
            encode: {
              itemName: 'Supplier ID', // Assuming 'Supplier ID' is the name field
              value: '2021', // Assuming '2021' is a column with numeric values
              tooltip: '2021'
            }
          }
        ] as echarts.SeriesOption[]
      };

      this.myChart.setOption(option);

      // Update the chart when the axis pointer updates
      this.myChart.on('updateAxisPointer', (event: any) => {
        const xAxisInfo = event.axesInfo[0];
        if (xAxisInfo) {
          const dimension = xAxisInfo.value + 1;
          this.myChart.setOption({
            series: [{
              id: 'pie',
              label: {
                // Ensure dynamic year updates correctly
                formatter: `{b}: {@[${dataSource[0][dimension]}]} ({d}%)`
              },
              encode: {
                value: dataSource[0][dimension], // Dynamically picking the correct year
                tooltip: dataSource[0][dimension]
              }
            }] as echarts.SeriesOption[]
          });
        }
      });
    } else {
      console.error("No data available or chart container is not ready.");
    }
  }


  ngOnDestroy(): void {
    if (this.myChart != null) {
      this.myChart.dispose();
    }
  }

}