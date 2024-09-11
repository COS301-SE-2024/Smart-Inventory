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

@Component({
  selector: 'app-upload-suppliers-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './upload-suppliers-modal.component.html',
  styleUrls: ['./upload-suppliers-modal.component.css']
})
export class UploadSuppliersModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  tenentId: string = '';
  uploading: boolean = false;
  isLoading: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<UploadSuppliersModalComponent>,
    private snackBar: MatSnackBar
  ) {
    Amplify.configure(outputs);
  }

  async ngOnInit() {
    await this.getTenentId();
  }

  async getTenentId() {
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
    } catch (error) {
      console.error('Error fetching tenent ID:', error);
      this.showSnackBar('Error fetching user information');
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      this.validateCsvFile(this.selectedFile);
    }
  }

  validateCsvFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const contents = e.target.result;
      const lines = contents.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map((header: string) => header.trim());
        const requiredColumns = ['company_name', 'contact_name', 'contact_email', 'phone_number', 'street', 'city', 'state_province', 'postal_code', 'country'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          this.showSnackBar(`Missing columns: ${missingColumns.join(', ')}`);
          this.selectedFile = null;
        } else {
          this.showSnackBar('File validated successfully', 'success');
        }
      } else {
        this.showSnackBar('The file is empty');
        this.selectedFile = null;
      }
    };
    reader.readAsText(file);
  }

  async uploadFile() {
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
          FunctionName: 'batchAddSuppliers',
          Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
        });

        const lambdaResponse = await lambdaClient.send(invokeCommand);
        const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

        if (responseBody && responseBody.statusCode === 201) {
          this.showSnackBar('Suppliers uploaded successfully', 'success');
          this.dialogRef.close(true);
        } else {
          throw new Error(responseBody ? responseBody.body : 'Unknown error occurred');
        }
      } catch (error) {
        console.error('Error uploading suppliers:', error);
        this.showSnackBar('Error uploading suppliers: ' + (error instanceof Error ? error.message : String(error)));
      } finally {
        this.isLoading = false;
        this.uploading = false;
      }
    } else {
      this.showSnackBar('Please select a valid file and ensure user information is loaded');
    }
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'csv') {
      return 'csv';
    } else {
      throw new Error('Only CSV files are supported');
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  downloadSampleFile() {
    const fileName = 'sample_suppliers.csv';
    const fileContent = this.getSampleFileContent();
    const blob = new Blob([fileContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  private getSampleFileContent(): string {
    return `company_name,contact_name,contact_email,phone_number,street,city,state_province,postal_code,country
Acme Inc.,John Doe,john@acme.com,123-456-7890,123 Main St,Anytown,CA,12345,USA
Global Tech,Jane Smith,jane@globaltech.com,987-654-3210,456 Oak Ave,Metropolis,NY,67890,USA`;
  }

  private showSnackBar(message: string, type: 'error' | 'success' = 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: type === 'error' ? ['error-snackbar'] : ['success-snackbar']
    });
  }
}