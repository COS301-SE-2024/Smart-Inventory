import { Injectable } from '@angular/core';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { Observable, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { InventoryService } from '../../../../amplify/services/inventory.service';
import { ChartConfig } from '../../pages/dashboard/dashboard.service';
import { forkJoin } from 'rxjs';

// Inventory summary items for predictive analytics
export interface InventorySummaryItem {
    SKU: string;
    tenentId: string;
    quantity: number;
    description: string;
    lowStockThreshold: number;
    reorderAmount: number;
    safetyStock: number;
    EOQ: number;
    ROP: number;
    upc: string;
    category: string;
    annualConsumptionValue: number;
    ABCCategory: string;
    createdAt: string;
    updatedAt: string;
}

export interface InventoryItem {
    SKU: string;
    category: string;
    quantity: number;
    lowStockThreshold: number;
    reorderAmount: number;
    unitCost: number;
    lastRestockDate: string;
}

export interface StockRequest {
    category: string;
    quantityRequested: number;
    createdAt: string;
}
@Injectable({
    providedIn: 'root',
})
export class DataCollectionService {
    chartConfigs: ChartConfig[] = [];
    inventoryData: InventoryItem[] = [];
    stockRequestData: StockRequest[] = [];

    constructor(private inventoryService: InventoryService) {
        Amplify.configure(outputs);
    }

    private async getTenantId(session: any): Promise<string> {
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

    private async invokeLambda(functionName: string, payload: any): Promise<any> {
        const session = await fetchAuthSession();
        const lambdaClient = new LambdaClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials,
        });

        const invokeCommand = new InvokeCommand({
            FunctionName: functionName,
            Payload: new TextEncoder().encode(JSON.stringify(payload)),
        });

        const lambdaResponse = await lambdaClient.send(invokeCommand);
        const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

        if (responseBody.statusCode === 200) {
            return JSON.parse(responseBody.body);
        } else {
            throw new Error(responseBody.body);
        }
    }

    // get inventory summary data for predictive analytics reporting
    getInventorySummary(): Observable<InventorySummaryItem[]> {
        return from(fetchAuthSession()).pipe(
            switchMap((session) => from(this.getTenantId(session))),
            switchMap((tenantId) => {
                if (!tenantId) {
                    throw new Error('TenantId not found in user attributes');
                }
                return from(this.fetchInventorySummary(tenantId));
            }),
            catchError((error) => {
                console.error('Error fetching inventory summary:', error);
                return [];
            }),
        );
    }

    private async fetchInventorySummary(tenantId: string): Promise<InventorySummaryItem[]> {
        try {
            const result = await this.invokeLambda('inventorySummary-getItems', {
                queryStringParameters: { tenentId: tenantId },
            });
            return JSON.parse(result);
        } catch (error) {
            console.error('Error fetching inventory summary:', error);
            throw error;
        }
    }

    getSupplierReportData(): Observable<any[]> {
        return from(this.fetchSupplierReportData()).pipe(
            map((suppliers) => suppliers || []),
            catchError((error) => {
                console.error('Error fetching supplier report data:', error);
                return [];
            }),
        );
    }

    getInventoryItems(): Observable<any> {
        return from(fetchAuthSession()).pipe(
            switchMap((session) => from(this.getTenantId(session))),
            switchMap((tenantId) => {
                if (!tenantId) {
                    throw new Error('TenantId not found in user attributes');
                }
                return this.inventoryService.getInventoryItems(tenantId);
            }),
            catchError((error) => {
                console.error('Error fetching inventory items:', error);
                return [];
            }),
        );
    }

    updateInventoryItem(updatedData: any): Observable<any> {
        return this.inventoryService.updateInventoryItem(updatedData);
    }

    createInventoryItem(formData: any): Observable<any> {
        return this.inventoryService.createInventoryItem(formData);
    }

    removeInventoryItem(inventoryID: string): Observable<any> {
        return from(fetchAuthSession()).pipe(
            switchMap((session) => from(this.getTenantId(session))),
            switchMap((tenantId) => {
                if (!tenantId) {
                    throw new Error('TenantId not found in user attributes');
                }
                return this.inventoryService.removeInventoryItem(inventoryID, tenantId);
            }),
        );
    }

    getInventoryItem(inventoryID: string): Observable<any> {
        return from(fetchAuthSession()).pipe(
            switchMap((session) => from(this.getTenantId(session))),
            switchMap((tenantId) => {
                if (!tenantId) {
                    throw new Error('TenantId not found in user attributes');
                }
                return this.inventoryService.getInventoryItem(inventoryID, tenantId);
            }),
        );
    }

    getOrderData(): Observable<any[]> {
        return from(Promise.resolve([]));
    }

    getSupplierData(): Observable<any[]> {
        // This method should be implemented to fetch supplier data
        // For now, it returns an empty array
        return from(Promise.resolve([]));
    }

    getStockRequests(): Observable<any[]> {
        return from(this.fetchStockRequests());
    }

    getSupplierQuotePrices(): Observable<any[]> {
        return from(this.fetchSupplierQuotePrices());
    }

    getActivityData(): Observable<any[]> {
        return from(this.fetchActivities()).pipe(
            map((activities) => activities || []),
            catchError((error) => {
                console.error('Error fetching activities:', error);
                return [];
            }),
        );
    }

    private async fetchStockRequests(): Promise<any[]> {
        try {
            const session = await fetchAuthSession();
            const tenantId = await this.getTenantId(session);
            return this.invokeLambda('Report-getItems', { pathParameters: { tenentId: tenantId } });
        } catch (error) {
            console.error('Error fetching stock requests:', error);
            throw error;
        }
    }

    async fetchOrdersReport() {
        try {
            const session = await fetchAuthSession();
            const tenantId = await this.getTenantId(session);
            return this.invokeLambda('getOrdersReport', { pathParameters: { tenentId: tenantId } });
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    private async fetchSupplierQuotePrices(): Promise<any[]> {
        try {
            const session = await fetchAuthSession();
            const tenantId = await this.getTenantId(session);
            return this.invokeLambda('getSupplierQuotePrices', { pathParameters: { tenentId: tenantId } });
        } catch (error) {
            console.error('Error fetching supplier quote prices:', error);
            throw error;
        }
    }

    private async fetchActivities(): Promise<any[]> {
        try {
            const session = await fetchAuthSession();
            const tenantId = await this.getTenantId(session);
            return this.invokeLambda('userActivity-getItems', { pathParameters: { tenentId: tenantId } });
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    }

    private async fetchSupplierReportData(): Promise<any[]> {
        try {
            const session = await fetchAuthSession();
            const tenantId = await this.getTenantId(session);
            return this.invokeLambda('getSupplierReportData', { pathParameters: { tenentId: tenantId } });
        } catch (error) {
            console.error('Error fetching supplier report data:', error);
            return [];
        }
    }

    generateChartConfigs(): Observable<ChartConfig[]> {
        return forkJoin({
            inventory: this.getInventoryItems(),
            requests: this.getStockRequests(),
        }).pipe(
            switchMap(({ inventory, requests }) => {
                this.inventoryData = inventory;
                this.stockRequestData = this.filterCurrentMonthRequests(requests);
                return this.createChartConfigs();
            }),
        );
    }

    private createChartConfigs(): Observable<ChartConfig[]> {
        return new Observable<ChartConfig[]>((observer) => {
            const configs = [
                this.prepareStockRequestChartConfig(),
                this.prepareStockRequestLineChartConfig(),
                this.prepareInventoryStockLevelChartConfig('pie'),
                this.prepareInventoryStockLevelChartConfig('bar'),
                this.prepareIntakeOutakeCorrelationChartConfig(),
                this.prepareAverageUnitCostByCategory(),
                this.prepareUnitCostDistribution(),
                this.prepareInventoryRequestBubbleChart(),
                this.prepareMonthlyCategoryRequestCountChartConfig(),
                this.prepareAvailableStockPerCategoryChartConfig(),
            ];
            observer.next(configs);
            observer.complete();
        });
    }

    filterCurrentMonthRequests(requests: StockRequest[]): StockRequest[] {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return requests.filter((request) => {
            const requestDate = new Date(request.createdAt);
            return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
        });
    }

    prepareMonthlyCategoryRequestCountChartConfig(): ChartConfig {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        // Filter requests for the current month
        const currentMonthRequests = this.stockRequestData.filter((request) => {
            const requestDate = new Date(request.createdAt);
            return requestDate.getMonth() === currentMonth && requestDate.getFullYear() === currentYear;
        });

        // Calculate total number of requests for each category
        const categoryRequestCounts = currentMonthRequests.reduce(
            (acc, request) => {
                acc[request.category] = (acc[request.category] || 0) + 1;
                return acc;
            },
            {} as { [key: string]: number },
        );

        // Prepare data for the pie chart
        const chartData = Object.entries(categoryRequestCounts).map(([category, count]) => ({
            name: category,
            value: count,
        }));

        return this.prepareChartConfig(
            'pie',
            chartData,
            'Number of Requests by Category (Current Month)',
            'PieChartComponent',
        );
    }

    prepareAvailableStockPerCategoryChartConfig(): ChartConfig {
        // Calculate total quantity for each category
        const categoryQuantities = this.inventoryData.reduce(
            (acc, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.quantity;
                return acc;
            },
            {} as { [key: string]: number },
        );

        // Prepare data for the pie chart
        const chartData = Object.entries(categoryQuantities).map(([category, quantity]) => ({
            name: category,
            value: quantity,
        }));

        return this.prepareChartConfig('pie', chartData, 'Available Stock by Category', 'PieChartComponent');
    }

    prepareStockRequestChartConfig(): ChartConfig {
        const categorySums = this.sumBy(this.stockRequestData, 'category');
        return this.prepareChartConfig(
            'pie',
            this.mapToChartData(categorySums),
            'Stock Requests by Category(Monthly)',
            'PieChartComponent',
        );
    }

    prepareStockRequestLineChartConfig(): ChartConfig {
        const dailySums = this.sumBy(this.stockRequestData, 'createdAt');
        const sortedDates = Object.keys(dailySums).sort();
        return this.prepareChartConfig(
            'line',
            {
                categories: sortedDates,
                values: sortedDates.map((date) => dailySums[date]),
            },
            'Daily Stock Requests',
            'LineChartComponent',
        );
    }

    prepareInventoryStockLevelChartConfig(chartType: 'pie' | 'bar'): ChartConfig {
        const categoryCounts = this.categorizeInventoryItems();
        const categories = ['Low Stock', 'Needs Reorder', 'Healthy Stock'];
        const data =
            chartType === 'pie'
                ? this.mapToChartData(categoryCounts)
                : { categories, values: categories.map((category) => categoryCounts[category] || 0) };
        return this.prepareChartConfig(
            chartType,
            data,
            'Inventory Stock Level Distribution ' + chartType,
            `${chartType.charAt(0).toUpperCase() + chartType.slice(1)}ChartComponent`,
        );
    }

    prepareIntakeOutakeCorrelationChartConfig(): ChartConfig {
        const categoryMap = new Map<string, { inventoryQuantity: number; requestedQuantity: number }>();

        this.inventoryData.forEach((item) => {
            if (!categoryMap.has(item.category)) {
                categoryMap.set(item.category, { inventoryQuantity: 0, requestedQuantity: 0 });
            }
            categoryMap.get(item.category)!.inventoryQuantity += item.quantity;
        });

        this.stockRequestData.forEach((request) => {
            if (!categoryMap.has(request.category)) {
                categoryMap.set(request.category, { inventoryQuantity: 0, requestedQuantity: 0 });
            }
            categoryMap.get(request.category)!.requestedQuantity += request.quantityRequested;
        });

        const categories = Array.from(categoryMap.keys());
        const inventoryData = categories.map((cat) => categoryMap.get(cat)!.inventoryQuantity);
        const requestData = categories.map((cat) => categoryMap.get(cat)!.requestedQuantity);

        const chartData = {
            categories: categories,
            series: [
                { name: 'Current Inventory', data: inventoryData },
                { name: 'Requested Quantity', data: requestData },
            ],
        };

        return this.prepareChartConfig(
            'bar',
            chartData,
            'Inventory vs Stock Requests by Category (Current Month)',
            'BarChartComponent',
        );
    }

    private sumBy(arr: any[], key: string): { [key: string]: number } {
        return arr.reduce(
            (acc, item) => ({
                ...acc,
                [item[key]]: (acc[item[key]] || 0) + item.quantityRequested,
            }),
            {},
        );
    }

    private mapToChartData(obj: { [key: string]: number }): { name: string; value: number }[] {
        return Object.entries(obj).map(([name, value]) => ({ name, value }));
    }

    private categorizeInventoryItems(): { [category: string]: number } {
        return this.inventoryData.reduce((acc: { [key: string]: number }, item) => {
            const category =
                item.quantity <= item.lowStockThreshold
                    ? 'Low Stock'
                    : item.quantity <= item.lowStockThreshold + item.reorderAmount
                      ? 'Needs Reorder'
                      : 'Healthy Stock';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
    }

    prepareAverageUnitCostByCategory(): ChartConfig {
        const categoryAverages = this.inventoryData.reduce(
            (acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = { total: 0, count: 0 };
                }
                acc[item.category].total += item.unitCost;
                acc[item.category].count++;
                return acc;
            },
            {} as { [key: string]: { total: number; count: number } },
        );

        const data = Object.entries(categoryAverages).map(([category, { total, count }]) => ({
            category,
            averageCost: total / count,
        }));

        return this.prepareChartConfig(
            'bar',
            { categories: data.map((d) => d.category), values: data.map((d) => d.averageCost) },
            'Average Unit Cost by Category',
            'BarChartComponent',
        );
    }

    prepareUnitCostDistribution(): ChartConfig {
        const costRanges = [0, 10, 20, 50, 100, 200, Infinity];
        const rangeLabels = costRanges
            .slice(0, -1)
            .map((min, index) => `$${min} - $${costRanges[index + 1] === Infinity ? '200+' : costRanges[index + 1]}`);

        const distribution = this.inventoryData.reduce(
            (acc, item) => {
                const rangeIndex = costRanges.findIndex((max) => item.unitCost < max) - 1;
                acc[rangeIndex] = (acc[rangeIndex] || 0) + 1;
                return acc;
            },
            {} as { [key: number]: number },
        );

        const data = {
            categories: rangeLabels,
            values: rangeLabels.map((_, index) => distribution[index] || 0),
        };

        return this.prepareChartConfig('bar', data, 'Unit Cost Distribution', 'BarChartComponent');
    }

    prepareInventoryRequestBubbleChart(): ChartConfig {
        const categoryData = new Map<
            string,
            { totalQuantity: number; totalCost: number; requestCount: number; itemCount: number }
        >();

        // Process inventory data
        this.inventoryData.forEach((item) => {
            if (!categoryData.has(item.category)) {
                categoryData.set(item.category, { totalQuantity: 0, totalCost: 0, requestCount: 0, itemCount: 0 });
            }
            const data = categoryData.get(item.category)!;
            data.totalQuantity += item.quantity;
            data.totalCost += item.unitCost * item.quantity;
            data.itemCount++;
        });

        // Process stock request data
        this.stockRequestData.forEach((request) => {
            if (categoryData.has(request.category)) {
                categoryData.get(request.category)!.requestCount += request.quantityRequested;
            }
        });

        // Prepare data for bubble chart
        const bubbleData = Array.from(categoryData.entries()).map(([category, data]) => ({
            name: category,
            value: [
                data.totalQuantity, // X-axis: Total Inventory Quantity
                data.totalCost / data.totalQuantity, // Y-axis: Average Unit Cost
                data.requestCount, // Bubble size: Number of Stock Requests
                data.itemCount, // Additional info for tooltip
            ],
        }));

        return this.prepareChartConfig(
            'bubble',
            bubbleData,
            'Inventory, Cost, and Demand by Category',
            'BubbleChartComponent',
        );
    }

    private prepareChartConfig(type: string, data: any, title: string, component: string): ChartConfig {
        return { type, data, title, component };
    }
}
