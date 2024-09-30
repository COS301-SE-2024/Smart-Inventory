import { Component, ElementRef, Input, SimpleChanges, ViewChild, OnChanges, AfterViewInit } from '@angular/core';
import { DataCollectionService } from 'app/components/add-widget-side-pane/data-collection.service';
import * as echarts from 'echarts';


type EChartsOption = echarts.EChartsOption;
type ChartData = {
	ItemSKU: string;
	AvailableQuantity: number;
	TotalPrice: number;
}[];

@Component({
	selector: 'app-bar-horizontal',
	standalone: true,
	imports: [],
	template: '<div #chartContainer class="chart-container"></div>',
	styles: ['.chart-container { width: 100%; height: 400px; }']
})
export class BarHorizontalComponent implements OnChanges, AfterViewInit {
	@ViewChild('chartContainer') chartContainer!: ElementRef;
	private myChart: echarts.ECharts | null = null;
	@Input() data: ChartData | null = null;
	@Input() chartTitle: string = "";
	private resizeObserver!: ResizeObserver;
	constructor(private dataCollectionService: DataCollectionService) {
		console.log('BarHorizontalComponent constructor called');
	}

	ngOnChanges(changes: SimpleChanges): void {
		console.log('BarHorizontalComponent ngOnChanges', changes);
		this.initOrUpdateChart();
	}

	ngAfterViewInit(): void {
		console.log('BarHorizontalComponent ngAfterViewInit');
		this.initOrUpdateChart();
		this.observeResize();
	}

	private observeResize(): void {
		this.resizeObserver = new ResizeObserver(() => {
			if (this.myChart) {
				this.myChart.resize();
			}
		});
		this.resizeObserver.observe(this.chartContainer.nativeElement);
	}

	private async initOrUpdateChart(): Promise<void> {
		if (this.chartContainer && this.chartContainer.nativeElement) {
			if (!this.myChart) {
				this.myChart = echarts.init(this.chartContainer.nativeElement);
			}

			if (!this.data || this.data.length === 0) {
				console.log('Data is empty, fetching from DataCollectionService');
				await this.fetchDataFromService();
			}

			if (this.data && this.data.length > 0) {
				console.log('Initializing chart with data:', this.data);
				const option: EChartsOption = this.getChartOption();
				this.myChart.setOption(option);
			} else {
				console.warn('Chart container or data not available');
			}
		}
	}

	private async fetchDataFromService(): Promise<void> {
		try {
			const supplierQuotes = await this.dataCollectionService.getSupplierQuotePrices().toPromise();
			if (supplierQuotes) {
				this.data = this.dataCollectionService.generateChartData(supplierQuotes);
			}
		} catch (error) {
			console.error('Error fetching data from DataCollectionService:', error);
		}
	}

	private getChartOption(): EChartsOption {
		if (!this.data) return {};

		const itemSKUs = this.data.map(item => item.ItemSKU);
		const availableQuantities = this.data.map(item => item.AvailableQuantity);
		const totalPrices = this.data.map(item => item.TotalPrice);

		return {
			title: {
				text: this.chartTitle || "Supplier Price and Availability Comparison",
				left: 'center',
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			legend: {
				data: ['Available Quantity', 'Total Price'],
				bottom: 0,
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '10%',
				containLabel: true,
			},
			xAxis: {
				type: 'value',
				name: 'Quantity and Price'
			},
			yAxis: {
				type: 'category',
				data: itemSKUs,
				name: 'Item SKU',
			},
			series: [
				{
					name: 'Available Quantity',
					type: 'bar',
					stack: 'total',
					label: {
						show: true,
						formatter: '{c} units'
					},
					data: availableQuantities
				},
				{
					name: 'Total Price',
					type: 'bar',
					stack: 'total',
					label: {
						show: true,
						formatter: 'R{c}'
					},
					data: totalPrices
				}
			]
		};
	}

	ngOnDestroy(): void {
		if (this.resizeObserver) {
			this.resizeObserver.disconnect();
		}
		if (this.myChart) {
			this.myChart.dispose();
		}
	}
}