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
import { Subject } from 'rxjs';

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
    [x: string]: any;
    @Input() isAddWidgetOpen: boolean = false;
    @Output() closed = new EventEmitter<void>();
    dashboard!: Array<DashboardItem>;
    private saveTrigger = new Subject<void>();

    availableCharts: { name: string; component: string }[] = [
        { name: 'Monthly Sales', component: 'BarChartComponent' },
        { name: 'Quarterly Revenue', component: 'LineChartComponent' },
        { name: 'Market Share', component: 'PieChartComponent' },
    ];

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
            type: 'line',
            data: { categories: ['Jan', 'Feb', 'Mar'], values: [3, 6, 9] },
            title: 'Quarterly Revenue',
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
    ];

    addWidget(chartConfig: any) {
        const newItem: GridsterItem = {
            cols: 6,
            rows: 2,
            y: 0,
            x: 0,
            cardId: chartConfig.title.toLowerCase().replace(' ', '-'),
            name: chartConfig.title,
            component: chartConfig.component,
            chartConfig: chartConfig,
        };
        this.dashboard.push(newItem);
        this.saveState();
        this.close();
    }

    saveState() {
        this.saveTrigger.next();
    }

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {}

    close() {
        this.closed.emit();
    }
}
