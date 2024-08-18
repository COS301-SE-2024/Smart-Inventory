import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';

@Component({
  selector: 'app-donuttemplate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donuttemplate.component.html',
  styleUrl: './donuttemplate.component.css'
})
export class DonutTemplateComponent implements OnChanges, AfterViewInit {
  @Input() orderData: any[] = [];
  private chart: echarts.ECharts | null = null;
  private data: any[] = [];

  constructor(private elementRef: ElementRef) { }

  ngAfterViewInit() {
    const chartDom = this.elementRef.nativeElement.querySelector('.chartContainer');
    this.chart = echarts.init(chartDom);
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orderData'] && this.chart) {
      this.updateChart();
    }
  }

  private updateChart() {
    if (!this.chart) return;

    const supplierData = this.processData(this.orderData);

    const option: echarts.EChartsOption = {
      title: {
        text: 'Order Costs by Supplier',
        subtext: 'Based on Order Data',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        name: 'Order Cost',
        type: 'pie',
        radius: '50%',
        data: this.data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    };

    this.chart.setOption(option);
  }

  private processData(data: any[]){
    const supplierTotals = data.reduce((acc, order) => {
      if (!acc[order.supplier]) {
        acc[order.supplier] = 0;
      }
      acc[order.supplier] += order.orderCost;
      return acc;
    }, {} as { [key: string]: number });

    this.data = Object.entries(supplierTotals).map(([name, value]) => ({
      name,
      value
    }));
  }
}
