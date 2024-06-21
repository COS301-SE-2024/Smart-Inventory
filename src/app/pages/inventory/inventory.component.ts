import { Component, OnInit } from '@angular/core';
import { ColDef } from 'ag-grid-community';
import { GridComponent } from '../../components/grid/grid.component';
import { MatButtonModule } from '@angular/material/button';
import { TitleService } from '../../components/header/title.service';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [GridComponent, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  rowData: any[] = [];
  showPopup = false;
  item = {
    productId: '',
    description: '',
    quantity: 0,
    sku: '',
    supplier: ''
  };

  constructor(private titleService: TitleService) {
    Amplify.configure(outputs);
  }

  async ngOnInit(): Promise<void> {
    this.titleService.updateTitle('Inventory');
    await this.loadInventoryData();
  }

  addButton: any = { text: 'Add Items', button: true };
  removeButton: any = { text: 'Remove Items', button: true };

  colDefs: ColDef[] = [
    { field: "sku", headerName: "SKU" },
    { field: "productId", headerName: "Product ID" },
    { field: "description", headerName: "Description" },
    { field: "quantity", headerName: "Quantity" },
    { field: "supplier", headerName: "Supplier" }
  ];

  defaultColDef: ColDef = {
    flex: 1,
  };

  async loadInventoryData() {
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

      const tenantId = getUserResponse.UserAttributes?.find(
        (attr) => attr.Name === 'custom:tenentId'
      )?.Value;

      if (!tenantId) {
        console.error('TenantId not found in user attributes');
        this.rowData = [];
        return;
      }

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
      console.log('Response from Lambda:', responseBody);

      if (responseBody.statusCode === 200) {
        const inventoryItems = JSON.parse(responseBody.body);
        this.rowData = inventoryItems.map((item: any) => ({
          sku: item.SKU,
          productId: item.productID,
          description: item.description,
          quantity: item.quantity,
          supplier: item.supplier
        }));
        console.log('Processed inventory items:', this.rowData);
      } else {
        console.error('Error fetching inventory data:', responseBody.body);
        this.rowData = [];
      }
    } catch (error) {
      console.error('Error in loadInventoryData:', error);
      this.rowData = [];
    }
  }

  openAddItemPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.item = {
      productId: '',
      description: '',
      quantity: 0,
      sku: '',
      supplier: ''
    };
  }

  async onSubmit(formData: any) {
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

      const tenantId = getUserResponse.UserAttributes?.find(
        (attr) => attr.Name === 'custom:tenentId'
      )?.Value;

      if (!tenantId) {
        throw new Error('TenantId not found in user attributes');
      }

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const payload = JSON.stringify({
        productID: formData.productId,
        description: formData.description,
        quantity: formData.quantity,
        sku: formData.sku,
        supplier: formData.supplier,
        tenentId: tenantId,
      });
      
      console.log('Payload:', payload);

      const invokeCommand = new InvokeCommand({
        FunctionName: 'Inventory-CreateItem',
        Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 201) {
        console.log('Inventory item added successfully');
        await this.loadInventoryData();
        this.closePopup();
      } else {
        throw new Error(responseBody.body);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      alert(`Error: ${(error as Error).message}`);
    }
  }
}