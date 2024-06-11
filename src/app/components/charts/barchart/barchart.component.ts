import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexTitleSubtitle, ApexTooltip, ApexXAxis } from 'ng-apexcharts';
import { MaterialModule } from '../../material/material.module';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
};

type DataYearly = {
  [year: string]: { name: string; data: number[] }[];
};


@Component({
  selector: 'app-barchart',
  standalone: true,
  imports: [NgApexchartsModule, CommonModule, FormsModule, MaterialModule],
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent {
  public selectedYear: string = new Date().getFullYear().toString(); // Default to current year

  public chartOptions!: ChartOptions;

  initializeChartOptions() {
    this.chartOptions = {
      series: [
        {
          name: 'Direct',
          data: [450, 700, 300, 500, 800, 300, 700, 600, 300, 400, 900, 800]
        },
        {
          name: 'Affiliate Driven',
          data: [300, 400, 200, 300, 500, 200, 300, 400, 200, 300, 500, 400]
        }
      ],
      chart: {
        type: 'bar',
        height: 350
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      title: {
        text: 'Orders'
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        enabled: true
      }
    };
  }

  updateChartData() {
    this.chartOptions.series = this.getSeriesDataByYear(this.selectedYear);
  }


  getSeriesDataByYear(year: string) {
    const data: DataYearly = {
      '2024': [
        { name: 'Direct', data: [450, 700, 300, 500, 800, 300, 700, 600, 300, 400, 900, 800] },
        { name: 'Affiliate Driven', data: [200, 300, 150, 200, 350, 150, 200, 250, 150, 200, 350, 300] }
      ],
      '2023': [
        { name: 'Direct', data: [400, 600, 250, 450, 750, 250, 650, 550, 250, 350, 850, 750] },
        { name: 'Affiliate Driven', data: [180, 250, 100, 150, 300, 100, 150, 200, 100, 150, 300, 250] }
      ],
      '2022': [
        { name: 'Direct', data: [350, 500, 200, 400, 700, 200, 600, 500, 200, 300, 800, 700] },
        { name: 'Affiliate Driven', data: [160, 200, 90, 140, 250, 90, 140, 190, 90, 140, 250, 200] }
      ],
      '2021': [
        { name: 'Direct', data: [300, 450, 150, 350, 650, 150, 550, 450, 150, 250, 750, 650] },
        { name: 'Affiliate Driven', data: [140, 180, 80, 130, 200, 80, 130, 180, 80, 130, 200, 180] }
      ]
    };
    return data[year] || data['2024']; // Fallback to 2024 if year is not found
  }


  constructor() {
    this.initializeChartOptions();
  }
}
