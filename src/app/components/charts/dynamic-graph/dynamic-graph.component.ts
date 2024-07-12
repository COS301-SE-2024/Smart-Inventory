import { Component } from '@angular/core';
import { AgChartsAngular } from 'ag-charts-angular';

@Component({
    selector: 'app-dynamic-graph',
    standalone: true,
    imports: [AgChartsAngular],
    templateUrl: './dynamic-graph.component.html',
    styleUrl: './dynamic-graph.component.css',
})
export class DynamicGraphComponent {}
