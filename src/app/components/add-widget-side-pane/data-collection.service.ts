import { Injectable } from '@angular/core';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { Observable, from } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { InventoryService } from '../../../../amplify/services/inventory.service';

@Injectable({
    providedIn: 'root',
})
export class DataCollectionService {
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

    getSupplierReportData(): Observable<any[]> {
        return from(this.fetchSupplierReportData()).pipe(
            map(suppliers => suppliers || []),
            catchError(error => {
                console.error('Error fetching supplier report data:', error);
                return [];
            })
        );
    }

    getInventoryItems(): Observable<any> {
        return from(fetchAuthSession()).pipe(
            switchMap(session => from(this.getTenantId(session))),
            switchMap(tenantId => {
                if (!tenantId) {
                    throw new Error('TenantId not found in user attributes');
                }
                return this.inventoryService.getInventoryItems(tenantId);
            }),
            catchError(error => {
                console.error('Error fetching inventory items:', error);
                return [];
            })
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
            switchMap(session => from(this.getTenantId(session))),
            switchMap(tenantId => {
                if (!tenantId) {
                    throw new Error('TenantId not found in user attributes');
                }
                return this.inventoryService.removeInventoryItem(inventoryID, tenantId);
            })
        );
    }

    getInventoryItem(inventoryID: string): Observable<any> {
        return from(fetchAuthSession()).pipe(
            switchMap(session => from(this.getTenantId(session))),
            switchMap(tenantId => {
                if (!tenantId) {
                    throw new Error('TenantId not found in user attributes');
                }
                return this.inventoryService.getInventoryItem(inventoryID, tenantId);
            })
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
            map(activities => activities || []),
            catchError(error => {
                console.error('Error fetching activities:', error);
                return [];
            })
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
}