import { Component, OnInit } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexTooltip
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-inventory-stats',
  templateUrl: './inventory-stats.component.html',
  styleUrls: ['./inventory-stats.component.scss'],
})
export class InventoryStatsComponent implements OnInit {

  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Electronics',
          data: this.generateBubbleData(20, 250, 15, 150, 30)
        },
        {
          name: 'Clothing',
          data: this.generateBubbleData(20, 250, 15, 150, 30)
        },
        {
          name: 'Home Appliances',
          data: this.generateBubbleData(20, 250, 15, 150, 30)
        },
        {
          name: 'Books',
          data: this.generateBubbleData(20, 250, 15, 150, 30)
        },
        {
          name: 'Fitness',
          data: this.generateBubbleData(20, 250, 15, 150, 30)
        }
      ],
      chart: {
        height: 350,
        type: 'bubble',
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        tickAmount: 12,
        type: 'category',
        title: {
          text: 'Inventory Levels'
        }
      },
      yaxis: {
        max: 250,
        title: {
          text: 'Sales Volume'
        }
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (y) {
            return `Sales: ${y.toFixed(0)}`;
          }
        }
      },
      title: {
        text: 'Inventory Levels vs Sales Volume by Product Category'
      }
    };
  }

  ngOnInit() { }

  generateBubbleData(baseval: number, range: number, count: number, yrange: number, zrange: number) {
    const data = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * range) + baseval + i * range / count; // Spread out inventory levels more
      const y = Math.floor(Math.random() * yrange) + 10 + i * yrange / count;   // Spread out sales volume more
      const z = Math.floor(Math.random() * zrange) + 5;                         // Consistent bubble size distribution
      data.push({ x, y, z });
    }
    return data;
  }

}
