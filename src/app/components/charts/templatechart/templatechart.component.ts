import { Component, AfterViewInit, Input, ElementRef, OnChanges, OnInit, ViewChild, SimpleChanges } from '@angular/core';
import * as echarts from 'echarts';
type EChartsOption = echarts.EChartsOption;
@Component({
  selector: 'app-templatechart',
  standalone: true,
  templateUrl: './templatechart.component.html',
  styleUrl: './templatechart.component.css'
})
export class TemplatechartComponent implements AfterViewInit, OnInit, OnChanges {
  @Input() chartType: string = 'bar';
  @Input() chartData: any;
  @Input() chartTitle: string = '';
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chart?: echarts.ECharts;

  ngOnInit(): void {
    // Initialization is moved to ngAfterViewInit
  }

  ngAfterViewInit(): void {
    this.chart = echarts.init(this.chartContainer.nativeElement);
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chart) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.chart) return;

    const option = this.getChartOption();
    this.chart.setOption(option);
    this.chart.resize();
  }

  private getChartOption(): echarts.EChartsOption {
    switch (this.chartType) {
      case 'sunburst':
        return this.getSunburstOption();
      case 'bar':
        return this.getBarOption();
      case 'line':
        return this.getLineOption();
      case 'pie':
        return this.getPieOption();
      default:
        return this.getDefaultOption();
    }
  }

  private getSunburstOption(): echarts.EChartsOption {
    // Your existing sunburst chart option
    return {
      title: {
        text: this.chartTitle || 'Inventory Category Analysis',
        left: 'center',
        textStyle: {
          color: '#fff'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} units ({d}%)'
      },
      series: [
        {
          name: 'Inventory',
          type: 'sunburst',
          data: this.chartData || [],
          radius: [0, '90%'],
          label: {
            rotate: 'radial'
          },
          emphasis: {
            focus: 'ancestor'
          },
          itemStyle: {
            color: (params: any) => {
              if (!params || !params.data) return '#000';
              const value = params.data.value;
              if (value < 50) return '#ff9896';
              if (value > 150) return '#2ca02c';
              return '#98df8a';
            }
          }
        }
      ]
    };
  }

  private getBarOption(): echarts.EChartsOption {
    // Implement bar chart option
    return {
      title: { text: this.chartTitle },
      xAxis: { type: 'category', data: this.chartData?.categories || [] },
      yAxis: { type: 'value' },
      series: [{ data: this.chartData?.values || [], type: 'bar' }]
    };
  }

  private getLineOption(): echarts.EChartsOption {
    // Implement line chart option
    return {
      title: { text: this.chartTitle },
      xAxis: { type: 'category', data: this.chartData?.categories || [] },
      yAxis: { type: 'value' },
      series: [{ data: this.chartData?.values || [], type: 'line' }]
    };
  }

  private getPieOption(): echarts.EChartsOption {
    // Implement pie chart option
    return {
      title: { text: this.chartTitle },
      series: [{
        type: 'pie',
        data: this.chartData || []
      }]
    };
  }

  private getDefaultOption(): echarts.EChartsOption {
    return {
      title: { text: 'Unsupported Chart Type' }
    };
  }
}
