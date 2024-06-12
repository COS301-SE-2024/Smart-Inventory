import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TitleService } from '../../components/header/title.service';
import { MaterialModule } from '../../components/material/material.module';
import { CommonModule } from '@angular/common';
import { GridsterModule } from 'angular-gridster2';
import { GridType, DisplayGrid } from 'angular-gridster2';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';

import { AddmemberComponent } from '../../components/modal/addmember/addmember.component';
import { TeamMember } from '../../components/model/team-member.model'; // Correct the import path
// import { BubblechartComponent } from '../../components/charts/bubblechart/bubblechart.component';
// import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { FilterService } from '../../services/filter.service';

interface Card extends GridsterItem {
  chartOptions: AgChartOptions;
  title: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.css'],
  standalone: true,
  imports: [MaterialModule, CommonModule, AddmemberComponent, GridsterModule, AgChartsAngular, BarchartComponent, DonutchartComponent]
})
export class DashboardComponent implements OnInit {

  options: GridsterConfig;
  dashboard: Array<GridsterItem>;

  public chartOptions: AgChartOptions;

  members: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', role: 'Analyst', selected: false },
    { id: 2, name: 'Bob White', role: 'Engineer', selected: false },
    { id: 3, name: 'Carol Blue', role: 'Manager', selected: false }
  ];

  teamMembers: TeamMember[] = [];

  cards: Card[] = [
    {
      x: 0, y: 0, rows: 1, cols: 2,
      chartOptions: {
        // chart options for the first card
      },
      title: 'Card 1'
    },
    {
      x: 0, y: 1, rows: 1, cols: 2,
      chartOptions: {
        // chart options for the second card
        autoSize: true,
        data: [
          { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
          { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
          { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
          { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
          { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
          { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
        ],
        // Series: Defines which chart type and data to use
        series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }]
      },
      title: 'Card 2'
    }
    // more cards as needed
  ];

  constructor(private dialog: MatDialog, private titleService: TitleService, private filterService: FilterService, private cdr: ChangeDetectorRef) {
    this.options = {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.Always,
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      },
      pushItems: true,
      minCols: 4,
      maxCols: 100,
      minRows: 10, // Increased minimum rows for better initial height
      maxRows: 100,
      minItemWidth: 100, // Minimum width each item can shrink to
      minItemHeight: 100, // Minimum height each item can shrink to
      maxItemCols: 50,  // Maximum columns an item can expand to
      maxItemRows: 50,  // Maximum rows an item can expand to
    };

    this.dashboard = [
      {
        cols: 2, rows: 5, y: 0, x: 0,
        component: BarchartComponent,
        chartOptions: {
          autoSize: true,
          data: [/* data specific to this chart */],
          series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }]
        }
      },
      {
        cols: 2, rows: 2, y: 0, x: 2,
        component: DonutchartComponent,
        chartOptions: {
          autoSize: true,
          data: [/* different data for this chart */],
          series: [{ type: 'pie', xKey: 'month', yKey: 'iceCreamSales' }]
        }
      }
      // Add more entries as needed
    ];


    this.chartOptions = {
      // Data: Data to be displayed in the chart
      autoSize: true,
      data: [
        { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
        { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
        { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
        { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
        { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
        { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
      ],
      // Series: Defines which chart type and data to use
      series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }]
    };
  }

  setFilter(filter: string): void {
    this.filterService.changeFilter(filter);
  }

  ngOnInit() {
    this.titleService.updateTitle('Dashboard');
  }

  openAddMemberDialog() {
    const availableMembers = this.members.filter(member => !this.teamMembers.some(tm => tm.id === member.id));
    const dialogRef = this.dialog.open(AddmemberComponent, {
      width: '500px',
      height: '500px',
      data: { members: availableMembers }
    });

    dialogRef.afterClosed().subscribe(selectedMembers => {
      if (selectedMembers) {
        this.teamMembers = [...this.teamMembers, ...selectedMembers];
        this.cdr.detectChanges();  // Force change detection
      }
    });
  }


  isMemberAlreadyAdded(member: TeamMember): boolean {
    return this.teamMembers.some(tm => tm.id === member.id);
  }

  removeMember(memberToRemove: TeamMember): void {
    this.teamMembers = this.teamMembers.filter(member => member.id !== memberToRemove.id);
  }
}
