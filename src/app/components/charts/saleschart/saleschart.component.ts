import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApexOptions } from 'ng-apexcharts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';


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
    // update chart data logic
    // alert(filter);
  }
}
