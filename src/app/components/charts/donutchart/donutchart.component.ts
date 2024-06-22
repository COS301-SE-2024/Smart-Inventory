import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgChartsAngular } from "ag-charts-angular";
import { AgChartOptions, AgCharts } from "ag-charts-community";
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
  public chartOptions: AgChartOptions;

  constructor() {
    this.chartOptions = {
      data: this.getData(),
      title: {
        text: "Portfolio Composition",
      },
      series: [
        {
          type: "donut",
          calloutLabelKey: "asset",
          angleKey: "amount",
          innerRadiusRatio: 0.5,
        },
      ],
      legend: {
        position: 'right',  // Positions the legend to the right
        item: {
          marker: {
            strokeWidth: 0  // Optional: Adjusts the marker stroke width if needed
          },
          paddingX: 16,  // Optional: Adjusts the horizontal padding of the legend items
          paddingY: 5    // Optional: Adjusts the vertical padding of the legend items
        }
      }
    };
  }

  public getChartData(): AgCharts {

    return {
      data: this.getData(),
      title: {
        text: "Portfolio Composition",
      },
      series: [
        {
          type: "donut",
          calloutLabelKey: "asset",
          angleKey: "amount",
          innerRadiusRatio: 0.5,
        },
      ],
      legend: {
        position: 'right',  // Positions the legend to the right
        item: {
          marker: {
            strokeWidth: 0  // Optional: Adjusts the marker stroke width if needed
          },
          paddingX: 16,  // Optional: Adjusts the horizontal padding of the legend items
          paddingY: 5    // Optional: Adjusts the vertical padding of the legend items
        }
      }
    };
  }

  getData() {
    return [
      { asset: "Stocks", amount: 60000 },
      { asset: "Bonds", amount: 40000 },
      { asset: "Cash", amount: 7000 },
      { asset: "Real Estate", amount: 5000 },
      { asset: "Commodities", amount: 3000 },
    ];
  }

  updateChartData(year: string) {
    this.chartOptions = this.getChartData();
    console.log(this.chartOptions);  // Check what is being set
  }

}
