import { Component, OnInit, ChangeDetectorRef, Type, ComponentFactoryResolver, ViewChild, ViewContainerRef } from '@angular/core';
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
import { BubblechartComponent } from '../../components/charts/bubblechart/bubblechart.component';
import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { FilterService } from '../../services/filter.service';

interface DashboardItem {
  type: string;
  cols: number;
  rows: number;
  y: number;
  x: number;
  name?: string;
  icon?: string;
  analytic?: string;
  percentage?: number;  // Ensure this is defined as a number if using the percent pipe
  component?: any;
}


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [MaterialModule, CommonModule, AddmemberComponent, GridsterModule, AgChartsAngular, BarchartComponent, DonutchartComponent, SaleschartComponent, BubblechartComponent]
})
export class DashboardComponent implements OnInit {

  options: GridsterConfig;
  charts: Type<any>[] = [];
  dashboard: DashboardItem[];
  largeItem: GridsterItem = {
    cols: 4, rows: 3, y: 1, x: 0
  };
  newLargeItem: GridsterItem = {
    cols: 4, rows: 4, y: 2, x: 0
  };

  SalesvsTarget: GridsterItem = {
    cols: 2, rows: 4, y: 2, x: 0
  };

  Product: GridsterItem = {
    cols: 2, rows: 4, y: 2, x: 0
  };

  @ViewChild('chartContainer', { read: ViewContainerRef }) chartContainer!: ViewContainerRef;
  selectedPeriod = 'year';
  periods = [
    { name: 'This Year', value: 'year' },
    { name: 'This Month', value: 'month' },
    { name: 'This Week', value: 'week' }
  ];
  sidebarOpen  = false;
  salesData = '450';
  earningsData = '$23,500';


  public chartOptions!: AgChartOptions;

  members: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', role: 'Analyst', selected: false },
    { id: 2, name: 'Bob White', role: 'Engineer', selected: false },
    { id: 3, name: 'Carol Blue', role: 'Manager', selected: false }
  ];

  teamMembers: TeamMember[] = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private dialog: MatDialog, private titleService: TitleService, private filterService: FilterService, private cdr: ChangeDetectorRef) {
    this.options = {
      gridType: GridType.VerticalFixed,
      displayGrid: DisplayGrid.None,
      draggable: {
        enabled: true
      },
      resizable: {
        enabled: true
      },
      pushItems: false,
      minCols: 4,
      maxCols: 4,
      minRows: 4, // Increased minimum rows for better initial height
      maxRows: 100,
      minItemWidth: 100, // Minimum width each item can shrink to
      minItemHeight: 50, // Minimum height each item can shrink to
      minItemCols: 1,  // Maximum columns an item can expand to
      minItemRows: 1,  // Maximum rows an item can expand to
      fixedRowHeight: 150,
      addEmptyRowsCount: 10
    };

    this.dashboard = [
      { cols: 1, rows: 1, y: 0, x: 0, name: 'Orders', icon: 'shopping_cart', analytic: '7500', percentage: 0.05, type: 'card' },
      { cols: 1, rows: 1, y: 0, x: 1, name: 'Sales', icon: 'trending_up', analytic: '450', percentage: -0.02, type: 'card' },
      { cols: 1, rows: 1, y: 0, x: 2, name: 'Earnings', icon: 'account_balance_wallet', analytic: '$23,500', percentage: 0.10, type: 'card' },
      { cols: 1, rows: 1, y: 0, x: 3, name: 'Commissions', icon: 'monetization_on', analytic: '$5,750', percentage: 0.03, type: 'card' },
    ];

  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  loadComponent(component: Type<any>) {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
    this.chartContainer.clear();
    this.chartContainer.createComponent(componentFactory);
  }


  setPeriod(period: string) {
    this.selectedPeriod = period;
    // this.setChartData(period);
  }

  addChart(type: string): void {
    let component: Type<any> | null = null;

    if (type === 'bar') {
      component = BarchartComponent;
    } else if (type === 'donut') {
      component = DonutchartComponent;
    } else if (type === 'area') {
      component = SaleschartComponent;
    }

    if (component) {
      // Calculate new position, assume each card takes 1 column and starts at row 0
      const positionX = this.dashboard.length % 4; // This will place new chart in next available column
      const positionY = Math.floor(this.dashboard.length / 4); // This increases the row number every 4 charts

      this.dashboard.push({
        cols: 2, // You might want to standardize or customize this based on type
        rows: 3, // Same as above
        y: positionY,
        x: positionX,
        name: type.charAt(0).toUpperCase() + type.slice(1) + ' Chart',
        type: 'chart',

        component: component
      });
    } else {
      console.error('Invalid chart type:', type);

    }
  }
  setFilter(filter: string): void {
    this.filterService.changeFilter(filter);
  }



  ngOnInit() {




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
