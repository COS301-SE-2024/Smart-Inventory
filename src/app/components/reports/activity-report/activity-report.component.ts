import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { TitleService } from '../../header/title.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatGridTile, MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { LoadingSpinnerComponent } from '../../loader/loading-spinner.component';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { ChartDataService } from '../../../services/chart-data.service';
import { Router } from '@angular/router';
import { CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType } from 'angular-gridster2';
import { GridsterModule } from 'angular-gridster2';
import { MatTooltip } from '@angular/material/tooltip';
import { DataCollectionService } from 'app/components/add-widget-side-pane/data-collection.service';

interface Metric {
    name: string;
    icon: string;
    value: string;
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
    tooltip: string;
}

interface ActivityReportType {
    title: string;
    subtitle: string;
    metrics: Metric[];
}

interface CustomGridsterItem extends GridsterItem {
    type: string;
    data?: Metric;
}

@Component({
    selector: 'app-activity-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        GridComponent,
        MatDialogModule,
        MatButtonModule,
        LoadingSpinnerComponent,
        AgChartsAngular,
        MatGridListModule,
        MatToolbarModule,
        MatGridTile,
        MatCardModule,
        MatIconModule,
        GridsterModule,
        MatTooltip,
    ],
    templateUrl: './activity-report.component.html',
    styleUrls: ['./activity-report.component.css'],
})
export class ActivityReportComponent implements OnInit, AfterViewInit {
    @ViewChild('gridComponent') gridComponent!: GridComponent;

    isLoading = false;
    rowData: any[] = [];
    options1!: AgChartOptions;
    options2!: AgChartOptions;
    optionsActivitiesByMember!: AgChartOptions;

    colDefs: ColDef[] = [
        { field: 'memberID', headerName: 'Member ID', filter: 'agSetColumnFilter' },
        { field: 'name', headerName: 'Name', filter: 'agSetColumnFilter' },
        { field: 'role', headerName: 'Role', filter: 'agSetColumnFilter' },
        { field: 'action', headerName: 'Action', filter: 'agSetColumnFilter' },
        { field: 'timestamp', headerName: 'Timestamp', filter: 'agSetColumnFilter' },
        { field: 'details', headerName: 'Details', filter: 'agSetColumnFilter' },
    ];

    ActivityReport: ActivityReportType = {
        title: 'Activity Report',
        subtitle: 'Overview of team member activities and relevant metrics.',
        metrics: [
            {
                name: 'Total Activities',
                icon: 'assessment',
                value: '0',
                percentage: 0,
                trend: 'up',
                tooltip: 'Total number of activities recorded.',
            },
            {
                name: 'Unique Members',
                icon: 'group',
                value: '0',
                percentage: 0,
                trend: 'up',
                tooltip: 'Number of unique members with activities.',
            },
            {
                name: 'Avg Activities/Member',
                icon: 'person',
                value: '0',
                percentage: 0,
                trend: 'up',
                tooltip: 'Average number of activities per member.',
            },
            {
                name: 'Latest Activity',
                icon: 'update',
                value: 'N/A',
                percentage: 0,
                trend: 'neutral',
                tooltip: 'Most recent activity timestamp.',
            },
        ],
    };

    @ViewChild('gridComponent') gridComponents!: any;
    options!: GridsterConfig;
    dashboard: Array<CustomGridsterItem> = [];

    constructor(
        private titleService: TitleService,
        private dialog: MatDialog,
        private router: Router,
        private chartDataService: ChartDataService,
        private changeDetectorRef: ChangeDetectorRef,
        private dataCollectionService: DataCollectionService,
    ) {
        console.log('ActivityReportComponent constructed');
        this.options = {
            gridType: GridType.VerticalFixed,
            displayGrid: DisplayGrid.None,
            compactType: CompactType.CompactDown,
            margin: 20,
            outerMargin: true,
            innerMargin: 10,
            mobileBreakpoint: 640,
            minCols: 12,
            maxCols: 12,
            maxItemCols: 12,
            minItemCols: 1,
            maxItemRows: 100,
            minItemRows: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            fixedColWidth: 100,
            fixedRowHeight: 100,
            minRows: 7.3, // Adjust based on your total layout height
            maxRows: 7.3, // Adjust based on your total layout height
            enableEmptyCellClick: false,
            enableEmptyCellContextMenu: false,
            enableEmptyCellDrop: false,
            enableEmptyCellDrag: false,
            enableOccupiedCellDrop: false,
            draggable: {
                enabled: false,
            },
            resizable: {
                enabled: false,
            },
            swap: false,
            pushItems: false,
            disablePushOnDrag: true,
            disablePushOnResize: true,
            pushDirections: { north: false, east: false, south: false, west: false },
            pushResizeItems: false,
        };
    }

    async ngOnInit() {
        console.log('ngOnInit called');
        this.titleService.updateTitle('Activity Report');
        await this.fetchActivities();
        setTimeout(() => {
            this.dashboard = [
                { cols: 4, rows: 1.3, y: 0, x: 0, type: 'metric', data: this.ActivityReport.metrics[0] },
                { cols: 4, rows: 1.3, y: 0, x: 4, type: 'metric', data: this.ActivityReport.metrics[1] },
                { cols: 4, rows: 1.3, y: 0, x: 8, type: 'metric', data: this.ActivityReport.metrics[2] },
                { cols: 12, rows: 6, y: 1.3, x: 0, type: 'grid' },
            ] as CustomGridsterItem[];
            this.changeDetectorRef.detectChanges();
        });
    }

    ngAfterViewInit() {
        console.log('ngAfterViewInit called');
        if (this.gridComponent) {
            console.log('Grid component initialized');
            console.log('Current rowData:', this.rowData);
            this.gridComponent.refreshGrid(this.rowData);
        } else {
            console.error('Grid component not initialized');
        }
        this.changeDetectorRef.detectChanges();
    }

    async fetchActivities() {
        console.log('Fetching activities...');
        this.isLoading = true;
        try {
            const activities = (await this.dataCollectionService.getActivityData().toPromise()) || [];
            console.log('Activities received:', activities);

            this.rowData = activities.map((activity: any) => ({
                memberID: activity.memberId,
                name: activity.name,
                role: activity.role,
                action: activity.task,
                timestamp: new Date(activity.createdAt).toLocaleString(),
                details: activity.details,
            }));

            console.log('Processed rowData:', this.rowData);

            this.updateCharts();
            this.updateMetrics();

            if (this.gridComponent) {
                console.log('Refreshing grid with new data');
                this.gridComponent.refreshGrid(this.rowData);
            } else {
                console.error('Grid component not found');
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
            this.rowData = [];
        } finally {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
        }
    }

    updateCharts() {
        console.log('Updating charts');
        const actionsByMember = new Map();
        this.rowData.forEach((row) => {
            if (!actionsByMember.has(row.name)) {
                actionsByMember.set(row.name, 0);
            }
            actionsByMember.set(row.name, actionsByMember.get(row.name) + 1);
        });
        this.options1 = this.chartDataService.setPieData(actionsByMember, 'Actions by Member');

        const actionTypes = new Map();
        this.rowData.forEach((row) => {
            if (!actionTypes.has(row.action)) {
                actionTypes.set(row.action, 0);
            }
            actionTypes.set(row.action, actionTypes.get(row.action) + 1);
        });
        this.options2 = this.chartDataService.setPieData(actionTypes, 'Action Types');

        this.optionsActivitiesByMember = this.chartDataService.setPieData(actionsByMember, 'Activities by Member');
        console.log('Charts updated');
    }

    updateMetrics() {
        console.log('Updating metrics');
        const totalActivities = this.rowData.length;
        const uniqueMembers = new Set(this.rowData.map((row) => row.memberID)).size;
        const avgActivities = totalActivities / uniqueMembers;
        const latestActivity = new Date(Math.max(...this.rowData.map((row) => new Date(row.timestamp).getTime())));

        this.ActivityReport.metrics[0].value = totalActivities.toString();
        this.ActivityReport.metrics[1].value = uniqueMembers.toString();
        this.ActivityReport.metrics[2].value = avgActivities.toFixed(2);
        this.ActivityReport.metrics[3].value = latestActivity.toLocaleString();

        // You can calculate percentage changes if you have previous data to compare
        // For now, we'll set them to 0
        this.ActivityReport.metrics.forEach((metric) => (metric.percentage = 0));

        console.log('Metrics updated:', this.ActivityReport.metrics);
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
