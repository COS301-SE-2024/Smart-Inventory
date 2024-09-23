import { Injectable } from '@angular/core';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DataCollectionService {
    constructor() {
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

    getInventoryData(tenantId: string): Observable<any[]> {
        // This method should be implemented to fetch inventory data
        // For now, it returns an empty array
        return from(Promise.resolve([]));
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
}