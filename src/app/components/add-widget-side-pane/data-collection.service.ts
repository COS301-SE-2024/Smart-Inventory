import { Injectable } from '@angular/core';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import outputs from '../../../../amplify_outputs.json';
import { Amplify } from 'aws-amplify';

@Injectable({
    providedIn: 'root',
})
export class DataCollectionService {
    getInventoryData() {}
    getOrderData() {}
    getSupplierData() {}
}
