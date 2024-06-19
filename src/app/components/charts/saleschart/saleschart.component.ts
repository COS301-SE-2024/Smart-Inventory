import { Component, OnDestroy, OnInit } from '@angular/core';
import { AgChartsAngular } from "ag-charts-angular";
import { AgChartOptions, AgCharts } from "ag-charts-community";
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';

interface DataSet {
  categories: string[];
  salesData: number[];
  earningsData: number[];
}

interface YearlyData {
  [key: string]: DataSet;
}

@Component({
  selector: 'app-saleschart',
  standalone: true,
  imports: [AgChartsAngular],
  templateUrl: './saleschart.component.html',
  styleUrl: './saleschart.component.css'
})
export class SaleschartComponent implements OnInit, OnDestroy {
  public chartOptions: AgChartOptions;
  private chart: any;
  private filterSubscription!: Subscription;

  private yearlyData: YearlyData = {
    'year': {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      salesData: [23000, 25000, 22000, 27000, 24000, 26000, 25000, 23000, 21000, 22000, 24000, 25000],
      earningsData: [15000, 12000, 14000, 13000, 16000, 13000, 14000, 15000, 12000, 14000, 16000, 13000]
    },
    'month': {
      categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      salesData: [7000, 8000, 7500, 6500],
      earningsData: [4000, 3000, 3500, 4500]
    },
    'week': {
      categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      salesData: [1100, 1200, 1050, 1250, 1600, 1300, 1400],
      earningsData: [700, 600, 650, 750, 900, 650, 700]
    },
    'day': {
      categories: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      salesData: [150, 200, 250, 300, 350, 400],
      earningsData: [100, 150, 200, 250, 300, 350]
    }
  };

  constructor(private filterService: FilterService) {
    this.chartOptions = {
      title: {
        text: "Sales by Month",
      },
      data: this.getData(),
      series: [
        {
          type: "area",
          xKey: "month",
          yKey: "subscriptions",
          yName: "Subscriptions",
          stacked: true,
        },
        {
          type: "area",
          xKey: "month",
          yKey: "services",
          yName: "Services",
          stacked: true,
        },
        {
          type: "area",
          xKey: "month",
          yKey: "products",
          yName: "Products",
          stacked: true,
        },
      ],
    };
    // this.chart = AgCharts.create(this.chartOptions);
    this.updateChartData('year');
  }

  getData() {
    return [
      { month: "Jan", subscriptions: 222, services: 250, products: 200 },
      { month: "Feb", subscriptions: 240, services: 255, products: 210 },
      { month: "Mar", subscriptions: 280, services: 245, products: 195 },
      { month: "Apr", subscriptions: 300, services: 260, products: 205 },
      { month: "May", subscriptions: 350, services: 235, products: 215 },
      { month: "Jun", subscriptions: 420, services: 270, products: 200 },
      { month: "Jul", subscriptions: 300, services: 255, products: 225 },
      { month: "Aug", subscriptions: 270, services: 305, products: 210 },
      { month: "Sep", subscriptions: 260, services: 280, products: 250 },
      { month: "Oct", subscriptions: 385, services: 250, products: 205 },
      { month: "Nov", subscriptions: 320, services: 265, products: 215 },
      { month: "Dec", subscriptions: 330, services: 255, products: 220 },
    ];
  }


  ngOnInit() {
    this.filterSubscription = this.filterService.currentFilter.subscribe(filter => {
      this.updateChartData(filter);
    });

    this.updateChartData('year');
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
    if (this.chart) {
      // AgCharts.destroy(this.chart); // Proper cleanup
    }
  }


  private updateChartData(filter: string) {
    const data = this.yearlyData[filter];
    if (!data) return;

    const newOptions = {
      data: data.categories.map((category, index) => ({
        category: category,
        sales: data.salesData[index],
        earnings: data.earningsData[index]
      })),
      axes: [
        {
          type: 'category',
          position: 'bottom',
          label: { rotation: 0 },
          categories: data.categories
        },
        {
          type: 'number',
          position: 'left'
        }
      ]
    };

    if (this.chart) {
      AgCharts.update(this.chart, newOptions);
    } else {
      // this.chartOptions = {...this.chartOptions, ...newOptions};
      this.chart = AgCharts.create(this.chartOptions);
    }
  }


}
