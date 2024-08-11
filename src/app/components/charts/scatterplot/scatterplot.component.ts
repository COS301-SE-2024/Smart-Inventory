import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-scatterplot',
  standalone: true,
  imports: [],
  templateUrl: './scatterplot.component.html',
  styleUrl: './scatterplot.component.css'
})
export class ScatterplotComponent implements OnChanges, AfterViewInit {
  @Input() data: any[] = [];
  private chart!: echarts.ECharts;

  @ViewChild('scatterContainer') private scatterContainerRef!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      console.log('New data received for scatter plot:', this.data);
      this.updateChartOptions();
    }
  }

  private initChart(): void {
    if (this.scatterContainerRef) {
      this.chart = echarts.init(this.scatterContainerRef.nativeElement);
      this.updateChartOptions();
    }
  }

  private updateChartOptions(): void {
    if (!this.chart) return;

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const unitPrice = params.data.value[0];
          const discount = params.data.value[1];
          const availableQuantity = params.data.value[2];
          const itemSKU = params.data.itemSKU;  // Assuming itemSKU is stored directly in data
          return `${itemSKU}<br/>Discount: ${discount}%<br/>Unit Price: R ${unitPrice}<br/>Quantity: ${availableQuantity}`;
        }
      },      
      xAxis: {
        type: 'value',
        name: 'Unit Price',
        min: 'dataMin', // Automatically scale axis to data minimum
        max: 'dataMax'  // Automatically scale axis to data maximum
      },
      yAxis: {
        type: 'value',
        name: 'Discount',
        min: 'dataMin',
        max: 'dataMax'
      },
      series: [{
        name: 'Discount vs Price',
        type: 'scatter',
        symbolSize: function (data) {
          return Math.sqrt(data[2]) * 5;  // Ensure that the size is correctly calculated
        },
        data: this.data.map(item => ({
          value: [item.unitPrice, item.discount, item.availableQuantity],
          itemSKU: item.itemSKU
        })),
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          // normal: {
          opacity: 0.8, // Ensure points are visible
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
          // }
        }
      }]
    };

    this.chart.setOption(option, true); // The second parameter ensures the option merge
  }
}