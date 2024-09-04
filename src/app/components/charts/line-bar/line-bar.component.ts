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
  @Input() data!: ChartData;
  private resizeObserver!: ResizeObserver;

  constructor() { }

  ngOnInit(): void { }

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
      this.initChart();
    }
  }

  initChart(): void {
    if (this.chartContainer && this.data && this.data.source) {
      if (!this.myChart) {
        this.myChart = echarts.init(this.chartContainer.nativeElement);
      }

      const dataSource = this.data.source;

      const option: EChartsOption = {
        title: {
          text: 'Total amount spent over periods',
          left: 'center',
          top: '2%',
        },
        tooltip: {
          trigger: 'axis',
          showContent: false
        },
        grid: {
          left: '5%',
          right: '5%',
          bottom: '15%',
          top: '50%',
          containLabel: true
        },
        legend: {
          orient: 'horizontal',
          bottom: '2%',
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
            radius: '25%',
            center: ['50%', '30%'],
            emphasis: { focus: 'self' },
            label: {
              formatter: '{b}: {@2021} ({d}%)'
            },
            encode: {
              itemName: 'Supplier ID',
              value: '2021',
              tooltip: '2021'
            }
          }
        ] as echarts.SeriesOption[]
      };

      this.myChart.setOption(option);

      this.myChart.on('updateAxisPointer', (event: any) => {
        const xAxisInfo = event.axesInfo[0];
        if (xAxisInfo) {
          const dimension = xAxisInfo.value + 1;
          this.myChart.setOption({
            series: [{
              id: 'pie',
              label: {
                formatter: `{b}: {@[${dataSource[0][dimension]}]} ({d}%)`
              },
              encode: {
                value: dataSource[0][dimension],
                tooltip: dataSource[0][dimension]
              }
            }] as echarts.SeriesOption[]
          });
        }
      });
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