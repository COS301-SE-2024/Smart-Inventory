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
        { category: 'Electronics', sales: 20000, target: 25000 },
        { category: 'Clothing', sales: 18000, target: 22000 },
        { category: 'Furniture', sales: 15000, target: 18000 },
        { category: 'Home Appliances', sales: 12000, target: 16000 },
        { category: 'Toys & Games', sales: 10000, target: 12000 }
      ],
      title: {
        text: "Sales VS Target by Category",
      },
      series: [
        {
          type: "bar",
          xKey: "category",
          yKey: "sales",
          yName: "Actual Sales",
          direction: 'horizontal',
          cornerRadius: 10,
          stacked: true,
          label: { enabled: true, formatter: params => `${params.value}` }
        },
        {
          type: "bar",
          xKey: "category",
          yKey: "target",
          yName: "Sales Target",
          direction: 'horizontal',
          cornerRadius: 10,
          stacked: true,
          label: { enabled: true, formatter: params => `${params.value}` }
        },
      ],
      axes: [
        {
          type: "category",
          position: "left",
          title: {
            text: "Product Category",
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
