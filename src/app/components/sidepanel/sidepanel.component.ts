import { Component, Inject, OnInit, HostBinding } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { ChartService } from '../../services/chart.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// import { ChartComponent } from '../modal/chart/chart.component';
import { MatDialog } from '@angular/material/dialog';
import { animate, state, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-sidepanel',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  templateUrl: './sidepanel.component.html',
  styleUrl: './sidepanel.component.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0%)' })),
      state('out', style({ transform: 'translateX(100%)' })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ])
  ]
})
export class SidepanelComponent implements OnInit{

  @HostBinding('@slideInOut') get slideInOut() {
    return this.sidePanelVisible ? 'in' : 'out';
  }

  sidePanelVisible: boolean = true;

  charts: any[] = [];

  constructor(private chartService: ChartService, public dialogRef: MatDialogRef<SidepanelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,private dialog: MatDialog) { }

  ngOnInit() {
    this.charts = this.chartService.getCharts();
  }

  openChart(chart: any) {
    this.dialog.open(SidepanelComponent, {
      width: '250px',
      data: { chart: chart }
    });
  }


}
