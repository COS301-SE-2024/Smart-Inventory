import { Component, OnInit, ViewChild } from '@angular/core';
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
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [GridComponent, MatButtonModule, CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnInit {
  @ViewChild('gridComponent') gridComponent!: GridComponent;

  rowData: any[] = [];
  showAddPopup = false;
  showDeletePopup = false;
  showRequestStockPopup = false;
  isLoading = true;
  rowsToDelete: any[] = [];
  item = {
    productId: '',
    description: '',
    quantity: 0,
    sku: '',
    supplier: ''
  };
  selectedItem: any = null;
  requestQuantity: number | null = null;

  colDefs: ColDef[] = [
    { field: "inventoryID", headerName: "Inventory ID", hide: true },
    { field: "sku", headerName: "SKU" },
    { field: "productId", headerName: "Product ID" },
    { field: "description", headerName: "Description" },
    { field: "quantity", headerName: "Quantity" },
    { field: "supplier", headerName: "Supplier" }
  ];

  addButton = { text: 'Add New Item' };

  constructor(private titleService: TitleService) {
    Amplify.configure(outputs);
  }

  async ngOnInit(): Promise<void> {
    this.titleService.updateTitle('Inventory');
    await this.loadInventoryData();
  }

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
          inventoryID: item.inventoryID,
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
    } finally {
      this.isLoading = false;
    }
  }

  openAddItemPopup() {
    this.showAddPopup = true;
  }

  closeAddPopup() {
    this.showAddPopup = false;
    this.item = {
      productId: '',
      description: '',
      quantity: 0,
      sku: '',
      supplier: ''
    };
  }

  async onSubmit(formData: any) {
    if (isNaN(formData.quantity)) {
      alert("Please enter a valid quantity");
      return;
    }

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
        this.closeAddPopup();
      } else {
        throw new Error(responseBody.body);
      }
    } catch (error) {
      console.error('Error:', (error as Error).message);
      alert(`Error: ${(error as Error).message}`);
    }
  }

  handleRowsToDelete(rows: any[]) {
    this.rowsToDelete = rows;
    this.showDeletePopup = true;
  }

  async confirmDelete() {
    if (this.rowsToDelete.length > 0) {
      for (const row of this.rowsToDelete) {
        await this.deleteInventoryItem(row.inventoryID);
      }
      this.gridComponent.removeConfirmedRows(this.rowsToDelete);
      this.rowsToDelete = [];
    }
    this.showDeletePopup = false;
    await this.loadInventoryData(); // Refresh the data after deletion
  }

  cancelDelete() {
    this.showDeletePopup = false;
    this.rowsToDelete = [];
  }

  async deleteInventoryItem(inventoryID: string) {
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
        inventoryID: inventoryID,
        tenentId: tenantId,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'Inventory-removeItem',
        Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        console.log('Inventory item deleted successfully');
      } else {
        throw new Error(responseBody.body);
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      alert(`Error deleting inventory item: ${(error as Error).message}`);
    }
  }

  async handleCellValueChanged(event: {data: any, field: string, newValue: any}) {
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

      const tenentId = getUserResponse.UserAttributes?.find(
        (attr) => attr.Name === 'custom:tenentId'
      )?.Value;

      if (!tenentId) {
        throw new Error('TenentId not found in user attributes');
      }

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const updatedData = {
        inventoryID: event.data.inventoryID,
        tenentId: tenentId,
        [event.field]: event.newValue
      };

      const invokeCommand = new InvokeCommand({
        FunctionName: 'Inventory-updateItem',
        Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(updatedData) })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        console.log('Inventory item updated successfully');
        // Update the local data to reflect the change
        const updatedItem = JSON.parse(responseBody.body);
        const index = this.rowData.findIndex(item => item.inventoryID === updatedItem.inventoryID);
        if (index !== -1) {
          this.rowData[index] = { ...this.rowData[index], ...updatedItem };
        }
      } else {
        throw new Error(responseBody.body);
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert(`Error updating inventory item: ${(error as Error).message}`);
      // Revert the change in the grid
      this.gridComponent.updateRow(event.data);
    }
  }

  openRequestStockPopup(item: any) {
    this.selectedItem = item;
    this.showRequestStockPopup = true;
    this.requestQuantity = null;
  }

  closeRequestStockPopup() {
    this.showRequestStockPopup = false;
    this.selectedItem = null;
    this.requestQuantity = null;
  }

  async requestStock() {
    if (this.requestQuantity === null || isNaN(this.requestQuantity)) {
      alert("Please enter a valid quantity");
      return;
    }
  
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
  
      const tenentId = getUserResponse.UserAttributes?.find(
        (attr) => attr.Name === 'custom:tenentId'
      )?.Value;
  
      if (!tenentId) {
        throw new Error('TenentId not found in user attributes');
      }
  
      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });
  
      // First, update the inventory
      const updatedQuantity = this.selectedItem.quantity - this.requestQuantity;
      const updateEvent = {
        data: this.selectedItem,
        field: 'quantity',
        newValue: updatedQuantity
      };
      await this.handleCellValueChanged(updateEvent);
  
      // Then, create the stock request report
      const reportPayload = {
        tenentId: tenentId,
        sku: this.selectedItem.sku,
        supplier: this.selectedItem.supplier,
        quantityRequested: this.requestQuantity.toString() // Ensure this is a string
      };
  
      console.log('Report Payload:', reportPayload); // Add this for debugging
  
      const createReportCommand = new InvokeCommand({
        FunctionName: 'Report-createItem',
        Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify(reportPayload) })),
      });
  
      const lambdaResponse = await lambdaClient.send(createReportCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
      console.log('Lambda Response:', responseBody); // Add this for debugging
  
      if (responseBody.statusCode === 201) {
        console.log('Stock request report created successfully');
        await this.loadInventoryData();
        this.closeRequestStockPopup();
      } else {
        throw new Error(JSON.stringify(responseBody.body));
      }
    } catch (error) {
      console.error('Error requesting stock:', error);
      alert(`Error requesting stock: ${(error as Error).message}`);
    }
  }
  
}