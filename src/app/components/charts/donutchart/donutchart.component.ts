import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgChartsAngular } from 'ag-charts-angular';
import { MaterialModule } from '../../material/material.module';
export interface ChartOptions {
  data: any[];
  series: any[];
}

type YearlyData = {
  [key: string]: number[];
};


@Component({
  selector: 'app-donutchart',
  standalone: true,
  imports: [FormsModule, MaterialModule, AgChartsAngular],
  templateUrl: './donutchart.component.html',
  styleUrl: './donutchart.component.css'
})

export class DonutchartComponent {
  public selectedYear: string = new Date().getFullYear().toString(); // Default to current year
  public chartOptions: ChartOptions;

  constructor() {
    this.chartOptions = this.getChartData(this.selectedYear);
  }

  public getChartData(year: string): ChartOptions {
    const data: YearlyData = {
      '2024': [44, 55, 41, 17, 15],
      '2023': [53, 32, 33, 52, 13],
      '2022': [63, 42, 23, 62, 23],
      '2021': [73, 52, 53, 72, 33]
    };

    const labels = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];

    return {
      data: labels.map((label, index) => ({ label: label, value: data[year][index] })),
      series: [{
        type: 'pie',
        angleKey: 'value',
        labelKey: 'label',
        innerRadiusOffset: -40 // Makes it a donut chart
      }]
    };
  }


  updateChartData(year: string) {
    this.chartOptions = this.getChartData(year);
  }
}
