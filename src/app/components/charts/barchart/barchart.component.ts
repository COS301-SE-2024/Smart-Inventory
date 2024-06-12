
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Renderer2, ElementRef, AfterViewInit } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { MaterialModule } from '../../material/material.module';

type DataYearly = {
  [year: string]: { name: string; data: number[] }[];
};


@Component({
  selector: 'app-barchart',
  standalone: true,
  imports: [AgChartsAngular, CommonModule, FormsModule, MaterialModule],
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css']
})
export class BarchartComponent implements AfterViewInit  {
  public selectedYear: string = new Date().getFullYear().toString(); // Default to current year

  public chartOptions: AgChartOptions;

  updateChartData() {
    this.chartOptions.data = this.getSeriesDataByYear(this.selectedYear);
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


  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.chartOptions = {
      // Data: Data to be displayed in the chart
      data: [
        { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
        { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
        { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
        { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
        { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
        { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
      ],
      // Series: Defines which chart type and data to use
      series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }]
    };
  }

  ngAfterViewInit() {
    const chartWrapper = this.el.nativeElement.querySelector('.ag-chart-wrapper');
    if (chartWrapper) {
      this.renderer.setStyle(chartWrapper, 'position', 'fixed');
    }
  }
}
