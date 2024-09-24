import { Component, Input, Output, EventEmitter, Type, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { templateQuoteModalComponent } from '../template-quote-modal/template-quote-modal.component';
import { BubblechartComponent } from '../../components/charts/bubblechart/bubblechart.component';
import { SaleschartComponent } from '../../components/charts/saleschart/saleschart.component';
import { BarchartComponent } from '../../components/charts/barchart/barchart.component';
import { DonutchartComponent } from '../../components/charts/donutchart/donutchart.component';
import { BarChartComponent } from 'app/components/charts/widgets/widgetBar';
import { LineChartComponent } from 'app/components/charts/widgets/widgetLine';
import { PieChartComponent } from 'app/components/charts/widgets/widgetPie';
import { BubbleChartComponent } from 'app/components/charts/widgets/widgetBubble';
import { ChartConfig, DashboardService } from '../../pages/dashboard/dashboard.service';
import { DataCollectionService } from './data-collection.service';

@Component({
    selector: 'app-templates-side-pane',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        templateQuoteModalComponent,
        BarchartComponent,
        DonutchartComponent,
        SaleschartComponent,
        BubblechartComponent,
        LineChartComponent,
        PieChartComponent,
        BarChartComponent,
        BubbleChartComponent,
    ],
    templateUrl: './add-widget-side-pane.component.html',
    styleUrls: ['./add-widget-side-pane.component.css'],
})
export class AddWidgetSidePaneComponent implements OnInit {
    @Input() isAddWidgetOpen = false;
    @Output() closed = new EventEmitter<void>();

    charts: { [key: string]: Type<any> } = {
        SaleschartComponent,
        BarchartComponent,
        BubblechartComponent,
        DonutchartComponent,
        BarChartComponent,
        LineChartComponent,
        PieChartComponent,
        BubbleChartComponent,
    };

    chartConfigs: ChartConfig[] = [];
    isLoading = true;

    constructor(
        private dashService: DashboardService,
        private dataCollectionService: DataCollectionService,
    ) {}

    ngOnInit() {
        this.fetchAndProcessData();
    }

    fetchAndProcessData() {
        this.isLoading = true;
        this.dataCollectionService.generateChartConfigs().subscribe({
            next: (chartConfigs: ChartConfig[]) => {
                this.chartConfigs = chartConfigs;
                this.chartConfigs.forEach((chart) => console.log(`${chart.title} configuration:`, chart));
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Error generating chart configs:', error);
                this.isLoading = false;
            },
        });
    }

    addWidget(chartConfig: ChartConfig) {
        this.dashService.addWidget(chartConfig);
        this.close();
    }

    close() {
        this.closed.emit();
    }
}
