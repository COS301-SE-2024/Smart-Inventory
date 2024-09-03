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
export class LineBarComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private myChart!: echarts.ECharts;
  @Input() data!: ChartData; // Input property to accept data
  private resizeObserver!: ResizeObserver;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initChart();
    this.observeResize();
  }

  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.myChart) {
        this.myChart.resize();
      }
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
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
        title: {
          text: 'Total amount spent over periods',
          left: 'center',
          top: '0px',
        },
        tooltip: {
          trigger: 'axis',
          showContent: false
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '12%',
          top: '15%',
          containLabel: true
        },
        legend: {
          orient: 'horizontal',
          bottom: '5%',
          left: 'center'
        },
        dataset: {
          source: dataSource
        },
        xAxis: { type: 'category' },
        yAxis: {},
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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.myChart) {
      this.myChart.dispose();
    }
  }

}