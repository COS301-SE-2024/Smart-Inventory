import { Component, OnInit, ChangeDetectorRef, Type, ElementRef, AfterViewInit, QueryList, ViewChildren } from '@angular/core';
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
import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { FilterService } from '../../services/filter.service';

interface CustomGridsterItem extends GridsterItem {
  component?: Type<any>;  // Optional Angular component type
  type?: string;           // Optional type identifier for the item
  label?: string;          // Optional label for display in the UI
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [MaterialModule, CommonModule, AddmemberComponent, GridsterModule, AgChartsAngular, BarchartComponent, DonutchartComponent, SaleschartComponent]
})
export class DashboardComponent implements OnInit, AfterViewInit {

  options: GridsterConfig;
  charts: Type<any>[] = [];
  dashboard: Array<CustomGridsterItem> = [];
  @ViewChildren('gridsterItemContent') gridsterItemContents!: QueryList<ElementRef>;

  public chartOptions!: AgChartOptions;

  members: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', role: 'Analyst', selected: false },
    { id: 2, name: 'Bob White', role: 'Engineer', selected: false },
    { id: 3, name: 'Carol Blue', role: 'Manager', selected: false }
  ];

  teamMembers: TeamMember[] = [];

  constructor(private dialog: MatDialog, private titleService: TitleService, private filterService: FilterService, private cdr: ChangeDetectorRef) {
    this.options = {
      gridType: GridType.VerticalFixed,
      displayGrid: DisplayGrid.Always,
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      },
      pushItems: false,
      minCols: 3,
      maxCols: 12,
      minRows: 1, // Increased minimum rows for better initial height
      maxRows: 100,
      minItemWidth: 100, // Minimum width each item can shrink to
      minItemHeight: 50, // Minimum height each item can shrink to
      maxItemCols: 12,  // Maximum columns an item can expand to
      maxItemRows: 10,  // Maximum rows an item can expand to
      fixedRowHeight: 100, 
      addEmptyRowsCount: 10
    };
    this.dashboard = [];
  }

  addChart(type: string) {
    let component: Type<any> | null = null;

    if (type === 'bar') {
      component = BarchartComponent;
    } else if (type === 'donut') {
      component = DonutchartComponent;
    }
    else if (type === 'area') {
      component = SaleschartComponent;
    }

    if (component) { // Ensure component is not null before adding to dashboard
      this.dashboard.push({
        cols: 2,
        rows: 3,
        y: 0,
        x: 0,
        component: component
      });
    } else {
      console.error('Invalid chart type:', type);
    }
  }

  setFilter(filter: string): void {
    this.filterService.changeFilter(filter);
  }

  adjustGridsterItemHeights() {
    this.gridsterItemContents.forEach((content, index) => {
      const height = content.nativeElement.offsetHeight;
      const rows = Math.ceil(height / this.options.fixedRowHeight!);
      this.dashboard[index].rows = rows;
    });
    this.cdr.detectChanges();  // Trigger change detection if necessary
  }
  
  ngAfterViewInit() {
    this.gridsterItemContents.changes.subscribe(() => {
      this.adjustGridsterItemHeights();
    });
  
    this.adjustGridsterItemHeights();  // Initial adjustment
  }
  

  ngOnInit() {

    this.dashboard = [
      {
        cols: 4, rows: 4, y: 0, x: 0,  // Team
        type: 'team',
        label: 'Team'
      },
      {
        cols: 4, rows: 4, y: 0, x: 4,  // Summary
        type: 'summary',
        label: 'Summary'
      },
      {
        cols: 4, rows: 4, y: 0, x: 8,  // Actions
        type: 'actions',
        label: 'Quick Actions'
      },
      {
        cols: 12, rows: 4, y: 4, x: 0,  // Analytics and Chart
        type: 'analyticsChart',
        label: 'Analytics and Chart'
      },
      {
        cols: 6, rows: 4, y: 8, x: 0,  // Detailed Interactions
        type: 'detailedInteractions',
        label: 'Detailed Interactions'
      },
      {
        cols: 6, rows: 4, y: 8, x: 6,  // Feature Area
        type: 'featureArea',
        label: 'Feature Area'
      },
      {
        cols: 2,
        rows: 3,
        y: 0,
        x: 0,
        component: DonutchartComponent
      }
    ];

    this.cdr.detectChanges();
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
