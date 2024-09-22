import { Component, Input, Output, EventEmitter, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { templateQuoteModalComponent } from '../template-quote-modal/template-quote-modal.component';
import { MatDialog, MatDialogModule, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BubblechartComponent } from '../../components/charts/bubblechart/bubblechart.component';
import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { BarChartComponent } from 'app/components/charts/widgets/widgetBar';
import { LineChartComponent } from 'app/components/charts/widgets/widgetLine';
import { PieChartComponent } from 'app/components/charts/widgets/widgetPie';
import { GridsterItem } from 'angular-gridster2';
import { DashboardService } from '../../pages/dashboard/dashboard.service';

interface ChartConfig {
    type: string;
    data: any;
    title: string;
    component: string;
}

interface DashboardItem extends GridsterItem {
    cardId?: string;
    name?: string;
    component?: string;
}

@Component({
    selector: 'app-templates-side-pane',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatDialogTitle,
        MatDialogContent,
        templateQuoteModalComponent,
        BarchartComponent,
        DonutchartComponent,
        SaleschartComponent,
        BubblechartComponent,
        LineChartComponent,
        PieChartComponent,
        BarChartComponent,
    ],
    templateUrl: './add-widget-side-pane.component.html',
    styleUrls: ['./add-widget-side-pane.component.css'],
})
export class AddWidgetSidePaneComponent {
    @Input() isAddWidgetOpen: boolean = false;
    @Output() closed = new EventEmitter<void>();

    charts: { [key: string]: Type<any> } = {
        SaleschartComponent: SaleschartComponent,
        BarchartComponent: BarchartComponent,
        BubblechartComponent: BubblechartComponent,
        DonutchartComponent: DonutchartComponent,
        BarChartComponent: BarChartComponent,
        LineChartComponent: LineChartComponent,
        PieChartComponent: PieChartComponent,
    };

    chartConfigs: ChartConfig[] = [
        {
            type: 'bar',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [5, 10, 15] },
            title: 'Monthly Sales',
            component: 'BarChartComponent',
        },
        {
            type: 'bar',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [5, 10, 15] },
            title: 'Requests Per Category',
            component: 'BarChartComponent',
        },
        {
            type: 'bar',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [5, 10, 15] },
            title: 'Supplier ratings',
            component: 'BarChartComponent',
        },
        {
            type: 'pie',
            data: [
                { name: 'Item A', value: 30 },
                { name: 'Item B', value: 70 },
            ],
            title: 'Top 5 Requested Items Requests Per Category',
            component: 'PieChartComponent',
        },
        {
            type: 'pie',
            data: [
                { name: 'Item A', value: 30 },
                { name: 'Item B', value: 70 },
            ],
            title: 'Quantity Per Category',
            component: 'PieChartComponent',
        },
        {
            type: 'line',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [3, 6, 9] },
            title: 'Quarterly Revenue',
            component: 'LineChartComponent',
        },
        {
            type: 'line',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [3, 6, 9] },
            title: 'Orders Over The year',
            component: 'LineChartComponent',
        },
        {
            type: 'pie',
            data: [
                { name: 'Item A', value: 30 },
                { name: 'Item B', value: 70 },
            ],
            title: 'Market Share',
            component: 'PieChartComponent',
        },
        {
            type: 'pie',
            data: [
                { name: 'Item A', value: 30 },
                { name: 'Item B', value: 70 },
            ],
            title: 'Orders On Time, Late and Before Promised',
            component: 'PieChartComponent',
        },
    ];

    addWidget(chartConfig: any) {
        this.dashService.addWidget(chartConfig);
        this.close();
    }

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private dashService: DashboardService,
    ) {}

    close() {
        this.closed.emit();
    }
}