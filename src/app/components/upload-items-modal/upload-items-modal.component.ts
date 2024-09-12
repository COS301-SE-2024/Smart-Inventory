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

  validateCsvFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const contents = e.target?.result as string;
      const lines = contents.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((header: string) => header.trim());
        const requiredColumns = ['SKU', 'upc', 'category', 'quantity', 'description', 'expirationDate', 'supplier', 'unitCost', 'deliveryCost', 'leadTime', 'lowStockThreshold', 'reorderAmount', 'annualDemand', 'dailyDemand', 'EOQ', 'holdingCost', 'safetyStock'];
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

  async uploadFile(): Promise<void> {
    if (this.selectedFile && this.tenentId) {
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

        const lambdaResponse = await lambdaClient.send(invokeCommand);
        const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

        if (responseBody && responseBody.statusCode === 201) {
          this.showSnackBar(`Successfully uploaded ${JSON.parse(responseBody.body).addedItems.length} inventory items.`, 'success');
          this.dialogRef.close(true);
        } else if (responseBody && responseBody.statusCode === 400) {
          const errorData = JSON.parse(responseBody.body);
          let errorMessage = 'Some items could not be added:\n\n';
          
          if (errorData.errors && errorData.errors.length > 0) {
            const supplierErrors = errorData.errors.filter((error: ErrorItem) => error.error.includes('Supplier'));
            const otherErrors = errorData.errors.filter((error: ErrorItem) => !error.error.includes('Supplier'));
            
            if (supplierErrors.length > 0) {
              const invalidSuppliers = [...new Set(supplierErrors.map((error: ErrorItem) => error.error.match(/"([^"]*)"/)?.[1] || ''))];
              errorMessage += `The following suppliers do not exist in your system: ${invalidSuppliers.join(', ')}. Please add these suppliers first.\n\n`;
            }
            
            if (otherErrors.length > 0) {
              errorMessage += 'Other errors:\n';
              otherErrors.forEach((error: ErrorItem) => {
                errorMessage += `- Item with SKU ${error.SKU}: ${error.error}\n`;
              });
            }
          }
          
          this.showSnackBar(errorMessage, 'error');
          console.error('Detailed errors:', errorData.errors);
        } else {
          throw new Error(responseBody ? responseBody.body : 'Unknown error occurred');
        }
      } catch (error: unknown) {
        console.error('Error uploading items:', error);
        this.showSnackBar(`Error uploading items: ${error instanceof Error ? error.message : String(error)}. Please try again or contact support if the issue persists.`);
      } finally {
        this.isLoading = false;
        this.uploading = false;
      }
    } else {
      this.showSnackBar('Please select a valid CSV file and ensure your user information is loaded before uploading.');
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error: ProgressEvent<FileReader>) => reject(error);
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

  private getSampleFileContent(): string {
    return `SKU,upc,category,quantity,description,expirationDate,supplier,unitCost,deliveryCost,leadTime,lowStockThreshold,reorderAmount,annualDemand,dailyDemand,EOQ,holdingCost,safetyStock
ITEM001,123456789012,Electronics,100,Widget A,2024-12-31,Supplier A,10.99,2.50,5,20,50,1000,2.74,200,1.5,30
ITEM002,234567890123,Home Appliances,75,Gadget B,2025-06-30,Supplier B,15.99,3.00,7,15,30,800,2.19,150,2.0,25`;
  }

  private showSnackBar(message: string, type: 'error' | 'success' = 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 10000,  // Increased duration to 10 seconds for longer messages
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}