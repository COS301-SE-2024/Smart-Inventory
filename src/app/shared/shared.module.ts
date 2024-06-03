import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { FinancialStatsComponent } from './financial-stats/financial-stats.component';
import { InventoryStatsComponent } from './inventory-stats/inventory-stats.component';
import { MultiSeriesComponent } from './multi-series/multi-series.component';
import { NgApexchartsModule } from 'ng-apexcharts';


@NgModule({
  declarations: [HeatmapComponent, FinancialStatsComponent, InventoryStatsComponent, MultiSeriesComponent],
  imports: [
    CommonModule,
    NgApexchartsModule
  ],
  exports: [HeatmapComponent, FinancialStatsComponent, InventoryStatsComponent, MultiSeriesComponent]
})
export class SharedModule { }
