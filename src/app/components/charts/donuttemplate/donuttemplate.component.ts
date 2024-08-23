import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as echarts from 'echarts';

@Component({
  selector: 'app-donuttemplate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donuttemplate.component.html',
  styleUrl: './donuttemplate.component.css'
})

export class DonutTemplateComponent implements OnChanges, AfterViewInit, OnInit {
  @Input() orderData: any[] = [];
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chart: echarts.ECharts | null = null;
  private data: any[] = [];

  ngOnInit() {
    this.processData(this.orderData);
  }

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orderData']) {
      this.processData(this.orderData);
      if (this.chart) {
        this.updateChart();
      }
    }
  }

  private initChart() {
    if (this.chartContainer && this.chartContainer.nativeElement) {
      this.chart = echarts.init(this.chartContainer.nativeElement);
      this.updateChart();

      // Handle window resize
      window.addEventListener('resize', () => {
        if (this.chart) {
          this.chart.resize();
        }
      });
    } else {
      console.error('Chart container not found');
    }
  }

  private updateChart() {
    if (!this.chart) return;

    const option: echarts.EChartsOption = {
      title: {
        text: 'Order Costs by Supplier',
        left: 'center',
        top: '5%'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '5%',
        left: 'center'
      },
      series: [{
        name: 'Order Cost',
        type: 'pie',
        radius: ['40%', '70%'],
        // center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: this.data
      }]
    };

    this.chart.setOption(option);
  }

  private processData(data: any[]) {
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