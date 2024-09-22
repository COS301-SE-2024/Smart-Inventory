import { Injectable } from '@angular/core';
import { number } from 'echarts';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { Amplify } from 'aws-amplify';

@Injectable({
  providedIn: 'root'
})

export class DataServiceService {

  private metricConfigs = {
    avgFulfillmentTime: {
      baseline: 24, // 24 hours as baseline
      goodThreshold: -10, // 10% faster is good
      badThreshold: 10, // 10% slower is bad
      isInverted: true // Lower is better
    },
    backorders: {
      baseline: 5, // 5 backorders as baseline
      goodThreshold: -20, // 20% reduction is good
      badThreshold: 20, // 20% increase is bad
      isInverted: true // Lower is better
    },
    inventoryLevels: {
      baseline: 1000, // 1000 items as baseline
      goodThreshold: 10, // 10% above baseline is good
      badThreshold: -10, // 10% below baseline is bad
      isInverted: false // Higher is better
    }
  };


  constructor() {
    Amplify.configure(outputs);
  }

  async getMonthlyRequest() {
    try {
      const session = await fetchAuthSession();
      const cognitoClient = new CognitoIdentityProviderClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const getUserCommand = new GetUserCommand({
        AccessToken: session.tokens?.accessToken.toString(),
      });

      const getUserResponse = await cognitoClient.send(getUserCommand);
      const tenentId = getUserResponse.UserAttributes?.find(attr => attr.Name === 'custom:tenentId')?.Value;

      if (!tenentId) {
        console.error('TenentId not found in user attributes');
        return null;
      }

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getMonthlyRequest',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      console.log('Response from Lambda:', responseBody);

      if (responseBody.statusCode === 200) {
        const data = JSON.parse(responseBody.body);
        return {
          monthlySales: data.monthlySales,
          quarterlyRevenue: data.quarterlyRevenue,
          marketShare: data.marketShare
        };
      } else {
        console.error('Error fetching monthly request data:', responseBody.body);
        return null;
      }
    } catch (error) {
      console.error('Error in getMonthlyRequest:', error);
      return null;
    }
  }

  processDashboardData(orders: any[], stockRequests: any[], inventoryItems: any[]): any {
    console.log('the data I sent:', orders, stockRequests, inventoryItems);
    const topSellerInfo = this.identifyTopSeller(stockRequests);
    return {
      avgFulfillmentTime: this.calculateAvgFulfillmentTime(orders),
      backorders: this.calculateBackorders(orders),
      inventoryLevels: this.calculateInventoryLevels(inventoryItems),
      topSeller: topSellerInfo.sku,
      topSellerPercentage: topSellerInfo.percentage,
      metricConfigs: this.metricConfigs
    };
  }

  private calculateAvgFulfillmentTime(orders: any[]): string {
    const completedOrders = orders.filter(order =>
      order.Order_Status === 'Completed' && order.Actual_Delivery_Date && order.Order_Date
    );

    if (completedOrders.length === 0) return '0 hrs';

    const totalHours = completedOrders.reduce((sum, order) => {
      const orderDate = new Date(order.Order_Date);
      const deliveryDate = new Date(order.Actual_Delivery_Date!);
      const hours = (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    const avgHours = totalHours / completedOrders.length;
    const days = Math.floor(avgHours / 24);
    const hours = Math.round(avgHours % 24);

    return days > 0 ? `${days} days ${hours} hrs` : `${hours} hrs`;
  }

  private calculateBackorders(orders: any[]): number {
    return orders.filter(order => order.Order_Status === 'Pending Approval').length;
  }

  private calculateInventoryLevels(inventoryItems: any[]): number {
    return inventoryItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  private identifyTopSeller(stockRequests: any[]): { sku: string; percentage: number } {
    const skuCounts = stockRequests.reduce((counts, request) => {
      counts[request.sku] = (counts[request.sku] || 0) + request.quantityRequested;
      return counts;
    }, {} as Record<string, number>);

    let topSku = '';
    let maxCount: any = 0;
    const totalCount: any = Object.values(skuCounts).reduce((sum, count) => (sum as number) + (count as number), 0);

    for (const [sku, count] of Object.entries(skuCounts)) {
      if ((count as number) > maxCount) {
        maxCount = count;
        topSku = sku;
      }
    }

    const percentage = totalCount > 0 ? (maxCount / totalCount) * 100 : 0;

    return {
      sku: topSku,
      percentage: Number(percentage.toFixed(2))
    };
  }
}
