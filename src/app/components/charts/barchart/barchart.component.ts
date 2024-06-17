
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
export class BarchartComponent implements AfterViewInit {
  public selectedYear: string = new Date().getFullYear().toString(); // Default to current year

  public chartOptions: AgChartOptions;

  updateChartData(year: string) {
    const seriesData = this.getDataByYear(year);

    this.chartOptions = {
      data: seriesData.flatMap(series => series),
      title: {
        text: "Direct VS Affliators",
      },
      footnote: {
        text: "Source: Department for Digital, Culture, Media & Sport",
      },
      series: [
        {
          type: "bar",
          xKey: "month",
          yKey: "Direct",
          yName: "Direct",
        },
        {
          type: "bar",
          xKey: "month",
          yKey: "Affiliate Driven",
          yName: "Affiliate Driven",
        },
      ],
      axes: [
        {
          type: "category",
          position: "bottom",
          title: {
            text: "Month",
          },
        },
        {
          type: "number",
          position: "left",
          title: {
            text: "Total Visitors",
          },
          label: {
            formatter: ({ value }) => this.formatNumber(value),
          },
        },
      ],
    };
  }

  formatNumber(value: number) {
    return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format(value);
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

  getDataByYear(year: string) {
    const yearlyData = this.getSeriesDataByYear(year);
    // We need to create a single array where each element has month, Direct, and Affiliate Driven keys
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const combinedData = [];

    for (let i = 0; i < 12; i++) {
      combinedData.push({
        month: months[i],
        Direct: yearlyData[0].data[i], // assuming Direct is always the first array element
        'Affiliate Driven': yearlyData[1].data[i] // assuming Affiliate Driven is always the second
      });
    }

    return combinedData;
  }

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.chartOptions = {};
  }

  ngOnInit() {
    this.updateChartData(this.selectedYear);
  }

  ngAfterViewInit() {
    // const chartWrapper = this.el.nativeElement.querySelector('.ag-chart-wrapper');
    // if (chartWrapper) {
    //   this.renderer.setStyle(chartWrapper, 'position', 'absolute');
    // }
  }
}
