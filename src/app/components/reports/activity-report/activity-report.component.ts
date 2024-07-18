import { TitleService } from '../../header/title.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { SaleschartComponent } from '../../charts/saleschart/saleschart.component';
import { ActivatedRoute, Router } from '@angular/router';

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
        SaleschartComponent,
    ],
    templateUrl: './activity-report.component.html',
    styleUrl: './activity-report.component.css',
})
export class ActivityReportComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private router: Router,
        private route: ActivatedRoute,
    ) {}

    rowData: any[] = [];

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
    }

    colDefs!: ColDef[];

    getCurrentRoute() {
        this.colDefs = [
            { field: 'Member ID', headerName: 'Member ID' },
            { field: 'Order Date', headerName: 'Order Date' },
            { field: 'description', headerName: 'Description' },
            { field: 'Address', headerName: 'Address' },
            { field: 'supplier', headerName: 'Supplier' },
            { field: 'automated', headerName: 'Automated' },
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
