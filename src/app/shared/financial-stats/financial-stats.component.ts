import { Component, OnInit } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexFill
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
  fill: ApexFill;
};

@Component({
  selector: 'app-financial-stats',
  templateUrl: './financial-stats.component.html',
  styleUrls: ['./financial-stats.component.scss'],
})
export class FinancialStatsComponent implements OnInit {

  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Expenses',
          data: [30, 40, 45, 50, 49, 60, 70, 91]
        },
        {
          name: 'Sales',
          data: [45, 76, 60, 75, 80, 70, 90, 100]
        },
        {
          name: 'Profit',
          data: [15, 36, 15, 25, 31, 10, 20, 9]
        }
      ],
      chart: {
        type: 'area',
        height: 350,
        stacked: false,
        toolbar: {
          show: true
        }
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ['#FFF'] // Sets data label colors to white
        }
      },
      xaxis: {
        type: 'category',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        labels: {
          style: {
            colors: '#FFF', // Sets x-axis label colors to white
            fontSize: '14px', // Optionally adjust the font size
            fontFamily: 'Helvetica, Arial, sans-serif' // Optionally adjust the font family
          }
        }
      },
      tooltip: {
        theme: 'dark', // This often works to ensure light text on dark backgrounds
        style: {
          fontSize: '12px',
          fontFamily: 'Helvetica, Arial, sans-serif'
        },
        x: {
          format: 'dd/MM/yy HH:mm'
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0.1,
          stops: [0, 90, 100]
        }
      }
    };
  }

  ngOnInit() { }
}
