import { Component, OnInit, ViewChild } from '@angular/core';
import {
	ApexAxisChartSeries,
	ApexChart,
	ApexXAxis,
	ApexTitleSubtitle,
	ChartComponent,
	ApexDataLabels,
	ApexPlotOptions,
	ApexTooltip,
	ApexFill,
	ApexLegend
} from 'ng-apexcharts';

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	xaxis: ApexXAxis;
	title: ApexTitleSubtitle;
	dataLabels: ApexDataLabels;
	plotOptions: ApexPlotOptions;
	tooltip: ApexTooltip;
	colors?: string[];  // Extend the ChartOptions to include the colors property
	fill?: ApexFill;
	legend?: ApexLegend;
};

@Component({
	selector: 'app-multi-series',
	templateUrl: './multi-series.component.html',
	styleUrls: ['./multi-series.component.scss'],
})
export class MultiSeriesComponent implements OnInit {
	public chartOptions: ChartOptions;

	constructor() {
		this.chartOptions = {
			series: [
				{
					name: 'Product A',
					data: [
						{ x: 'January', y: [500, 600] },
						{ x: 'February', y: [600, 700] },
						{ x: 'March', y: [700, 800] },
						{ x: 'April', y: [650, 750] },
						{ x: 'May', y: [700, 800] },
						{ x: 'June', y: [750, 850] }
					]
				},
				{
					name: 'Product B',
					data: [
						{ x: 'January', y: [400, 500] },
						{ x: 'February', y: [450, 550] },
						{ x: 'March', y: [500, 600] },
						{ x: 'April', y: [550, 650] },
						{ x: 'May', y: [600, 700] },
						{ x: 'June', y: [650, 750] }
					]
				},
				{
					name: 'Product C',
					data: [
						{ x: 'January', y: [300, 400] },
						{ x: 'February', y: [350, 450] },
						{ x: 'March', y: [400, 500] },
						{ x: 'April', y: [450, 550] },
						{ x: 'May', y: [500, 600] },
						{ x: 'June', y: [550, 650] }
					]
				}
			],
			chart: {
				height: 350,
				type: "rangeBar"
			},
			plotOptions: {
				bar: {
					horizontal: true,
					barHeight: "50%",
					rangeBarGroupRows: true
				}
			},
			colors: [
				"#008FFB",
				"#00E396",
				"#FEB019",
				"#FF4560",
				"#775DD0",
				"#3F51B5",
				"#546E7A",
				"#D4526E",
				"#8D5B4C",
				"#F86624",
				"#D7263D",
				"#1B998B",
				"#2E294E",
				"#F46036",
				"#E2C044"
			],
			fill: {
				type: "solid"
			},
			xaxis: {
				type: "datetime"
			},
			legend: {
				position: "right"
			},
			tooltip: {
				custom: function (opts) {
					const fromYear = new Date(opts.y1).getFullYear();
					const toYear = new Date(opts.y2).getFullYear();
					const values = opts.ctx.rangeBar.getTooltipValues(opts);

					return (
						'<div class="apexcharts-tooltip-rangebar">' +
						'<div> <span class="series-name" style="color: ' +
						values.color +
						'">' +
						(values.seriesName ? values.seriesName : "") +
						"</span></div>" +
						'<div> <span class="category">' +
						values.ylabel +
						' </span> <span class="value start-value">' +
						fromYear +
						'</span> <span class="separator">-</span> <span class="value end-value">' +
						toYear +
						"</span></div>" +
						"</div>"
					);
				}
			},
			title: {
				text: "Your Chart Title",
				align: "center"
			},
			dataLabels: {
				enabled: false
			}
		};
	}

	ngOnInit() { }
}
