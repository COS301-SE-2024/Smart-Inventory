import { Component, OnInit } from '@angular/core';
import { AgChartsAngular } from "ag-charts-angular";
import { AgChartOptions } from "ag-charts-community";


@Component({
  selector: 'app-bubblechart',
  standalone: true,
  imports: [AgChartsAngular],
  templateUrl: './bubblechart.component.html',
  styleUrl: './bubblechart.component.css'
})
export class BubblechartComponent implements OnInit {
  public chartOptions: AgChartOptions;

  constructor() {
    this.chartOptions = {
      data:[
        { country: 'United States', sales: 8000, target: 20000 },
        { country: 'Brazil', sales: 7000, target: 10000 },
        { country: 'Australia', sales: 3500, target: 5000 },
        { country: 'Russia', sales: 1500, target: 3000 },
        { country: 'Uruguay', sales: 500, target: 2500 }
      ],
      title: {
        text: "Sales VS Target",
      },
      series: [
        {
          type: "bar",
          xKey: "country",
          yKey: "sales",
          yName: "Sales",
          direction: 'horizontal',
          cornerRadius: 10,
          stacked: true,
        },
        {
          type: "bar",
          xKey: "country",
          yKey: "target",
          yName: "Target",
          direction: 'horizontal',
          cornerRadius: 10,
          stacked: true,
        },
      ],
      axes: [
        {
          type: "category",
          position: "left",
          title: {
            text: "Countries",
          },
        },
        {
          type: "number",
          position: "bottom",
          title: {
            text: "USD",
          },
        },
      ],
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
