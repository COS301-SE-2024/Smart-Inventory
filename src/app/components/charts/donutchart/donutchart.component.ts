import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { ApexChart, ChartType } from 'ng-apexcharts'; // Ensure ChartType is imported

export interface ChartOptions {
  series: number[];
  chart: ApexChart;
  labels: string[];
  responsive: any[];
}

type YearlyData = {
  [year: string]: { series: number[]; labels: string[]; };
};


@Component({
  selector: 'app-donutchart',
  standalone: true,
  imports: [NgApexchartsModule, FormsModule],
  templateUrl: './donutchart.component.html',
  styleUrl: './donutchart.component.css'
})

export class DonutchartComponent {
  public selectedYear: string = new Date().getFullYear().toString(); // Default to current year
  public donutChartOptions: ChartOptions = {
    series: [44, 55, 41, 17, 15],
    chart: {
      type: 'donut', // This now directly uses ChartType from the library
      height: 350
    },
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' }
      }
    }]
  };

  constructor() {
    this.donutChartOptions = this.getChartData(this.selectedYear);
  }

  public getChartData(year: string): ChartOptions {
    const data: YearlyData = {
      '2024': {
        series: [44, 55, 41, 17, 15],
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
      },
      '2023': {
        series: [53, 32, 33, 52, 13],
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
      },
      '2022': {
        series: [63, 42, 23, 62, 23],
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
      },
      '2021': {
        series: [73, 52, 53, 72, 33],
        labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
      }
    };
    return {
      series: data[year]?.series || data['2024'].series,
      chart: { type: 'donut' as ChartType, height: 350 },
      labels: data[year]?.labels || data['2024'].labels,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }]
    };
  }


  updateChartData(year: string) {
    this.donutChartOptions = this.getChartData(year);
  }
}
