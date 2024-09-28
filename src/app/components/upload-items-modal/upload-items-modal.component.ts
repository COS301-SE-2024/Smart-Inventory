import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';

interface ErrorItem {
  SKU: string;
  error: string;
}

@Component({
  selector: 'app-upload-items-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './upload-items-modal.component.html',
  styleUrls: ['./upload-items-modal.component.css']
})
export class UploadItemsModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  tenentId: string = '';
  uploading: boolean = false;
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<UploadItemsModalComponent>,
    private snackBar: MatSnackBar
  ) {
    Amplify.configure(outputs);
  }

  async ngOnInit(): Promise<void> {
    await this.getTenentId();
  }

  async getTenentId(): Promise<void> {
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

      this.tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value || '';
    } catch (error: unknown) {
      console.error('Error fetching tenent ID:', error);
      this.showSnackBar('Error fetching user information. Please try again or contact support.');
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.validateCsvFile(this.selectedFile);
    }
  }

// In the validateCsvFile method
validateCsvFile(file: File): void {
  const reader = new FileReader();
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const contents = e.target?.result as string;
    const lines = contents.split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map((header: string) => header.trim());
      const requiredColumns = ['SKU', 'upc', 'category', 'quantity', 'description', 'expirationDate', 'supplier', 'unitCost', 'deliveryCost', 'leadTime', 'lowStockThreshold', 'reorderAmount'];
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        this.showSnackBar(`CSV file is missing the following required columns: ${missingColumns.join(', ')}. Please correct your file and try again.`);
        this.selectedFile = null;
      } else {
        this.showSnackBar('File validated successfully. You can now upload the items.', 'success');
      }
    } else {
      this.showSnackBar('The CSV file is empty. Please upload a file with inventory data.');
      this.selectedFile = null;
    }
  };
  reader.readAsText(file);
}

  // Update the getSampleFileContent method
  private getSampleFileContent(): string {
    return `SKU,upc,category,quantity,description,expirationDate,supplier,unitCost,deliveryCost,leadTime,lowStockThreshold,reorderAmount
  ITEM001,123456789012,Electronics,100,Widget A,2024-12-31,Foodcorp,10.99,2.50,5,20,50
  ITEM002,234567890123,Home Appliances,75,Gadget B,2025-06-30,Foodcorp,15.99,3.00,7,15,30`;
  }

  async uploadFile(): Promise<void> {
    if (!this.selectedFile || !this.tenentId) {
      this.showSnackBar('Please select a valid CSV file and ensure your user information is loaded before uploading.');
      return;
    }
  
    this.isLoading = true;
    this.uploading = true;
  
    try {
      const fileContent = await this.readFileAsBase64(this.selectedFile);
      const fileType = this.getFileType(this.selectedFile.name);
      const session = await fetchAuthSession();
      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });
  
      const payload = JSON.stringify({
        fileContent,
        fileType,
        tenentId: this.tenentId
      });
  
      const invokeCommand = new InvokeCommand({
        FunctionName: 'batchAddInventoryItems',
        Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
      });
  
      const lambdaResponse = await this.retryLambdaInvocation(lambdaClient, invokeCommand, 3);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
      if (responseBody && responseBody.statusCode === 201) {
        const successData = JSON.parse(responseBody.body);
        this.showSnackBar(`Successfully uploaded ${successData.addedItems.length} inventory items.`, 'success');
        this.dialogRef.close(true);
      } else if (responseBody && responseBody.statusCode === 400) {
        const errorData = JSON.parse(responseBody.body);
        let errorMessage = errorData.message + '\n\n';
        
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage += 'Detailed errors:\n';
          errorData.errors.forEach((error: ErrorItem) => {
            errorMessage += `- Item with SKU ${error.SKU}: ${error.error}\n`;
          });
        }
        
        this.showSnackBar(errorMessage, 'error');
        console.error('Detailed errors:', errorData.errors);
      } else {
        throw new Error(responseBody ? responseBody.body : 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error uploading items:', error);
      this.showSnackBar(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}. Please try again or contact support if the issue persists.`);
    } finally {
      this.isLoading = false;
      this.uploading = false;
    }
  }
  
  private async retryLambdaInvocation(client: LambdaClient, command: InvokeCommand, maxRetries: number): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await client.send(command);
      } catch (error) {
        console.error(`Lambda invocation attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }
  }
  
  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
  
  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return 'csv';
    } else {
      throw new Error('Only CSV files are supported for inventory upload.');
    }
  }
  
  private showSnackBar(message: string, type: 'error' | 'success' = 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 10000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  downloadSampleFile(): void {
    const fileName = 'sample_inventory_items.csv';
    const fileContent = this.getSampleFileContent();
    const blob = new Blob([fileContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
}