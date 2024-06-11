import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
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
  imports: [NgApexchartsModule],
  templateUrl: './saleschart.component.html',
  styleUrl: './saleschart.component.css'
})
export class SaleschartComponent implements OnInit, OnDestroy {
  public chartOptions: ApexOptions;
  filter: string = '';
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
      series: [{
        name: 'Sales',
        data: [23000, 25000, 22000, 27000, 24000, 26000, 25000]
      }, {
        name: 'Earnings',
        data: [15000, 12000, 14000, 13000, 16000, 13000, 14000]
      }],
      chart: {
        type: 'area',
        height: 350
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy'
        }
      },
      colors: ['#5470C6', '#91CC75']
    };
  }

  ngOnInit() {
    this.filterSubscription = this.filterService.currentFilter.subscribe(filter => {
      this.filter = filter;
      this.updateChartData(filter);
    });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  private updateChartData(filter: string) {
    const data = this.yearlyData[filter];
    if (!data) return;

    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        name: 'Sales',
        data: data.salesData
      }, {
        name: 'Earnings',
        data: data.earningsData
      }],
      xaxis: {
        categories: data.categories
      }
    };
  }

}
