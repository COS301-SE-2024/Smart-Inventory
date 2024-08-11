import { Injectable } from '@angular/core';
import { BarchartComponent } from '../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../components/charts/donutchart/donutchart.component';
import { SaleschartComponent } from '../components/charts/saleschart/saleschart.component';
@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  getCharts() {
    return [
      { name: 'Bar Chart', component: BarchartComponent },
      { name: 'Donut Chart', component: DonutchartComponent },
      { name: 'Area Chart', component: SaleschartComponent }
    ];
  }
}
