import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AgChartsAngular } from 'ag-charts-angular';
import { AgChartOptions, AgCartesianChartOptions } from 'ag-charts-community';
import { GridComponent } from '../../grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { Router } from '@angular/router';
import { TitleService } from '../../header/title.service';
import { ChartDataService } from '../../../services/chart-data.service';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from 'app/components/loader/loading-spinner.component';
@Component({
  selector: 'app-inventory-report',
  templateUrl: './inventory-report.component.html',
  styleUrls: ['./inventory-report.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatGridListModule,
    MatCardModule,
    MatProgressSpinnerModule,
    AgChartsAngular,
    GridComponent,
    LoadingSpinnerComponent
  ]
})
export class InventoryReportComponent implements OnInit {
  @ViewChild('gridComponent') gridComponent!: GridComponent;

  rowData: any[] = [];
  colDefs: ColDef[] = [];
  options1!: AgChartOptions;
  options2!: AgChartOptions;
  options3!: AgChartOptions;
  options4!: AgChartOptions;
  options5: any;
  InventoryReport: any;
  isLoading = true;

  constructor(
    private titleService: TitleService,
    private router: Router,
    public service: ChartDataService
  ) {
    Amplify.configure(outputs);
  }

  async ngOnInit() {
    this.titleService.updateTitle('Inventory Report');
    this.isLoading = true;
    await this.loadInventoryData();
    await this.updateInventoryWithRequests();
    this.setupCharts();
    this.setupMetrics();
    this.isLoading = false;
  }

  async loadInventoryData() {
    try {
      const session = await fetchAuthSession();
      const tenantId = await this.getTenantId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'Inventory-getItems',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenantId } })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        const inventoryItems = JSON.parse(responseBody.body);
        this.rowData = inventoryItems.map((item: any) => ({
          inventoryID: item.inventoryID,
          sku: item.SKU,
          category: item.category,
          productId: item.productID,
          description: item.description,
          quantity: item.quantity,
          supplier: item.supplier,
          expirationDate: item.expirationDate,
          lowStockThreshold: item.lowStockThreshold,
          reorderFreq: item.reorderFreq,
          requests: 0,
          requestsQuantity: 0
        }));
        this.setupColumnDefs();
      } else {
        console.error('Error fetching inventory data:', responseBody.body);
        this.rowData = [];
      }
    } catch (error) {
      console.error('Error in loadInventoryData:', error);
      this.rowData = [];
    }
  }

  setupColumnDefs() {
    this.colDefs = [
      { field: 'sku', headerName: 'SKU' },
      { field: 'category', headerName: 'Category' },
      { field: 'description', headerName: 'Description' },
      { field: 'quantity', headerName: 'Quantity' },
      { field: 'lowStockThreshold', headerName: 'Low Stock Threshold'},
      { field: 'supplier', headerName: 'Supplier' },
      { field: 'requests', headerName: 'Requests' },
      { field: 'requestsQuantity', headerName: 'Requests Quantity'},
    ];
  }

  async updateInventoryWithRequests() {
    try {
      const stockRequests = await this.fetchStockRequests();

      const skuMap = new Map<string, { requests: number; quantity: number }>();

      stockRequests.forEach((request: any) => {
        const { sku, quantityRequested } = request;
        if (!skuMap.has(sku)) {
          skuMap.set(sku, { requests: 0, quantity: 0 });
        }
        const currentData = skuMap.get(sku)!;
        currentData.requests += 1;
        currentData.quantity += Number(quantityRequested);
        skuMap.set(sku, currentData);
      });

      this.rowData = this.rowData.map(item => {
        const requestData = skuMap.get(item.sku);
        if (requestData) {
          return {
            ...item,
            requests: requestData.requests,
            requestsQuantity: requestData.quantity
          };
        }
        return item;
      });

      if (this.gridComponent) {
        this.gridComponent.refreshGrid(this.rowData);
      }
    } catch (error) {
      console.error('Error updating inventory with requests:', error);
    }
  }

  async fetchStockRequests() {
    try {
      const session = await fetchAuthSession();
      const tenantId = await this.getTenantId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'Report-getItems',
        Payload: new TextEncoder().encode(JSON.stringify({ 
          pathParameters: { tenentId: tenantId } 
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        return JSON.parse(responseBody.body);
      } else {
        throw new Error(responseBody.body);
      }
    } catch (error) {
      console.error('Error fetching stock requests:', error);
      throw error;
    }
  }

  async getTenantId(session: any) {
    const cognitoClient = new CognitoIdentityProviderClient({
      region: outputs.auth.aws_region,
      credentials: session.credentials,
    });

    const getUserCommand = new GetUserCommand({
      AccessToken: session.tokens?.accessToken.toString(),
    });
    const getUserResponse = await cognitoClient.send(getUserCommand);

    const tenantId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

    if (!tenantId) {
      throw new Error('TenantId not found in user attributes');
    }

    return tenantId;
  }

  setupCharts() {
    this.options1 = this.service.setPieData(this.calculateCategoryTotalQuantities(), 'Quantity per Category');
    this.options2 = this.service.setPieData(this.calculateCategoryTotalRequests(), 'Requests per Category');
    this.options3 = this.service.setBarData(
      this.calculateCategoryTotalQuantities(),
      this.calculateCategoryTotalRequests(),
      this.calculateCategoryTotalRequestsQuantity(),
      'Requests Vs Quantity per Category'
    );
    this.options4 = this.service.setPieData(
      this.calculateCategoryTotalRequestsQuantity(), // Changed from calculateCategoryTotalRequests
      'Requests Quantity per Category'
    );
    this.options5 = this.setYearlyCorrelationData();
  }

  setYearlyCorrelationData(): any {
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const yearlyData = monthNames.map(month => ({
      month,
      stockLevel: 0,
      requests: 0,
      requestQuantity: 0
    }));

    this.rowData.forEach(item => {
      const expirationDate = new Date(item.expirationDate);
      if (expirationDate.getFullYear() === currentYear) {
        const monthIndex = expirationDate.getMonth();
        yearlyData[monthIndex].stockLevel += item.quantity;
        yearlyData[monthIndex].requests += item.requests;
        yearlyData[monthIndex].requestQuantity += item.requestsQuantity;
      }
    });

    return {
      title: {
        text: 'Yearly correlation between requests, quantity of requests and stock level'
      },
      data: yearlyData,
      series: [{
        type: 'line',
        xKey: 'month',
        yKey: 'stockLevel',
        yName: 'Stock Level'
      }, {
        type: 'line',
        xKey: 'month',
        yKey: 'requests',
        yName: 'Requests'
      }, {
        type: 'line',
        xKey: 'month',
        yKey: 'requestQuantity',
        yName: 'Request Quantity'
      }],
      legend: {
        position: 'bottom'
      },
      axes: [{
        type: 'category',
        position: 'bottom'
      }, {
        type: 'number',
        position: 'left'
      }]
    };
  }

  setupMetrics() {
    this.InventoryReport = {
      title: 'Inventory Report',
      subtitle: 'Overall view of inventory, metrics, and analytics.',
      metrics: {
        metric_1: `Total Stock Items: ${this.calculateTotal('quantity')}`,
        metric_2: `Total Requests: ${this.calculateTotal('requests')}`,
        metric_3: `Total Stock Quantity Requested: ${this.calculateTotal('requestsQuantity')}`,
        metric_4: `Total Low Stock Items: ${this.calculateTotalLowStock()}`,
        metric_5: `Inventory Accuracy: ${this.calculateAccuracy()}%`,
        metric_6: `Stock to Request Ratio: ${this.calculateRatio()}`,
       // metric_7: `Fulfilled requests: ${this.calculateFulfilledRequests()}`,
       // metric_8: `Pending/Failed requests: ${this.calculatePendingFailedRequests()}`,
        //metric_9: `Service Level: ${this.calculateServiceLevel()}%`,
        //metric_10: `Accuracy of Forecast Demand: ${this.calculateForecastAccuracy()}%`,
        metric_11: `Inventory Shrinkage: ${this.calculateInventoryShrinkage()}%`,
        metric_12: `Deadstock (due to expiration): ${this.calculateDeadstock()}`,
        metric_13: `Lost Sales Ratio: ${this.calculateLostSalesRatio()}%`,
      },
    };
  }

  calculateTotal(column: string): number {
    return this.rowData.reduce((sum, item) => sum + (item[column] || 0), 0);
  }

  calculateTotalLowStock(): number {
    return this.rowData.filter(item => item.quantity <= item.lowStockThreshold).length;
  }

  calculateAccuracy(): string {
    // Placeholder implementation
    return '99.5';
  }

  calculateRatio(): string {
    const requests = this.calculateTotal('requests');
    const quantity = this.calculateTotal('quantity');
    return (requests / quantity).toFixed(3);
  }

  calculateCategoryTotalQuantities(): Map<string, number> {
    return this.calculateCategoryTotal('quantity');
  }

  calculateCategoryTotalRequests(): Map<string, number> {
    return this.calculateCategoryTotal('requests');
  }

  calculateCategoryTotalRequestsQuantity(): Map<string, number> {
    return this.calculateCategoryTotal('requestsQuantity');
  }

  calculateCategoryTotal(field: string): Map<string, number> {
    const totals = new Map<string, number>();
    this.rowData.forEach(item => {
      const currentTotal = totals.get(item.category) || 0;
      totals.set(item.category, currentTotal + (item[field] || 0));
    });
    return totals;
  }

  calculateFulfilledRequests(): number {
    // Assuming fulfilled requests are 90% of total requests
    return Math.floor(this.calculateTotal('requests') * 0.9);
  }

  calculatePendingFailedRequests(): number {
    // Assuming pending/failed requests are 10% of total requests
    return Math.ceil(this.calculateTotal('requests') * 0.1);
  }

  calculateServiceLevel(): string {
    // Service Level = (Fulfilled Requests / Total Requests) * 100
    const fulfilledRequests = this.calculateFulfilledRequests();
    const totalRequests = this.calculateTotal('requests');
    return ((fulfilledRequests / totalRequests) * 100).toFixed(2);
  }

  calculateForecastAccuracy(): string {
    // Simulating forecast accuracy based on the difference between requests and stock
    const totalRequests = this.calculateTotal('requestsQuantity');
    const totalStock = this.calculateTotal('quantity');
    const accuracy = 100 - Math.abs((totalRequests - totalStock) / totalStock * 100);
    return accuracy.toFixed(2);
  }

  calculateInventoryShrinkage(): string {
    // Simulating inventory shrinkage as a small percentage of total inventory
    const totalInventory = this.calculateTotal('quantity');
    const shrinkage = totalInventory * 0.02; // Assuming 2% shrinkage
    return ((shrinkage / totalInventory) * 100).toFixed(2);
  }

  calculateLostSalesRatio(): string {
    // Lost Sales Ratio = (Unfulfilled Requests / Total Requests) * 100
    const unfulfilledRequests = this.calculatePendingFailedRequests();
    const totalRequests = this.calculateTotal('requests');
    return ((unfulfilledRequests / totalRequests) * 100).toFixed(2);
  }

  calculateDeadstock(): number {
      const currentDate = new Date();
      return this.rowData.reduce((total, item) => {
        const expirationDate = new Date(item.expirationDate);
        if (expirationDate <= currentDate) {
          return total + item.quantity;
        }
        return total;
      }, 0);
  }

  back() {
    this.router.navigate(['/reports']);
  }
}