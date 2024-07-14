import { Component, Inject, OnInit  } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { ChartService } from '../../services/chart.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-sidepanel',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './sidepanel.component.html',
  styleUrl: './sidepanel.component.css'
})
export class SidepanelComponent implements OnInit{

  charts: any[] = [];

  constructor(private chartService: ChartService, public dialogRef: MatDialogRef<ChartModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.charts = this.chartService.getCharts();
  }

  openChart(chart: any) {
    this.dialog.open(ChartModalComponent, {
      width: '250px',
      data: { chart: chart }
    });
  }


}
