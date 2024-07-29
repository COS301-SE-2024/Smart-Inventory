import { TitleService } from '../../header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { ActivatedRoute, Router } from '@angular/router';
import { ChartDataService } from '../../../services/chart-data.service';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';

@Component({
    selector: 'app-activity-report',
    standalone: true,
    imports: [
        GridComponent,
        MatCardModule,
        MatGridListModule,
        MaterialModule,
        CommonModule,
        MatProgressSpinnerModule,
        AgChartsAngular,
    ],
    templateUrl: './activity-report.component.html',
    styleUrl: './activity-report.component.css',
})
export class ActivityReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
        private service: ChartDataService,
    ) {}

    rowData: any[] = [];
    options1!: AgChartOptions;
    options2!: AgChartOptions;
    selectedItem: any = null;
    requestQuantity: number | null = null;

    ActivityReport = {
        title: 'Order Report',
        subtitle:
            'Have an overall view of your inventory, relevant metrics to assist you in automation and ordering and provide analytics associated with it.',
        metrics: {
            metric_1: 'Average completed activities: ',
            metric_2: 'Idle users: ',
            metric_3: 'Average time to complete a task: ',
        },
        graphs: [],
    };
    ngOnInit() {
        this.titleService.updateTitle(this.getCurrentRoute());
        this.options1 = this.service.setPieData(this.calculateCategoryTotalQuantities(), 'Time Spent per Member');
        this.options2 = this.service.setPieData(this.calculateCategoryTotalQuantities(), 'Idle Time per Member');
    }

    colDefs!: ColDef[];

    calculateCategoryTotalQuantities(): Map<string, number> {
        const categoryTotals = new Map<string, number>();

        this.rowData.forEach((element) => {
            const category = element.category;
            const currentTotal = categoryTotals.get(category) || 0;
            categoryTotals.set(category, currentTotal + element.timeSpent);
        });
        return categoryTotals;
    }

    getCurrentRoute() {
        this.colDefs = [
            { field: 'memberID', headerName: 'Member ID' },
            { field: 'name', headerName: 'Name' },
            { field: 'role', headerName: 'Role' },
            { field: 'task', headerName: 'Task' },
            { field: 'timeSpent', headerName: 'Time Spent' },
            { field: 'idleTime', headerName: 'Idle Time' },
        ];
        return 'Activity Report';
    }

    calculateAverage(column: any): number {
        const sum = this.rowData.reduce((acc, row) => acc + row[column], 0);
        return sum / this.rowData.length;
    }
    calculateTotal(column: any): number {
        const sum = this.rowData.reduce((acc, row) => acc + row[column], 0);
        return sum;
    }

    back() {
        this.router.navigate(['/reports']);
    }
}
