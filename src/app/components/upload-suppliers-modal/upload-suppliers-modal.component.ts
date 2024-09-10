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

@Component({
  selector: 'app-upload-suppliers-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './upload-suppliers-modal.component.html',
  styleUrls: ['./upload-suppliers-modal.component.css']
})
export class UploadSuppliersModalComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFile: File | null = null;
  tenentId: string = '';
  uploading: boolean = false;

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
      this.snackBar.open('Error fetching user information', 'Close', { duration: 3000 });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  async uploadFile() {
    if (this.selectedFile && this.tenentId) {
      this.uploading = true;
      try {
        console.log('Reading file as base64...');
        const fileContent = await this.readFileAsBase64(this.selectedFile);
        console.log('File read successfully.');

        console.log('Getting file type...');
        const fileType = this.getFileType(this.selectedFile.name);
        console.log('File type:', fileType);

        console.log('Fetching auth session...');
        const session = await fetchAuthSession();
        console.log('Auth session fetched.');

        console.log('Creating Lambda client...');
        const lambdaClient = new LambdaClient({
          region: outputs.auth.aws_region,
          credentials: session.credentials,
        });
        console.log('Lambda client created.');

        const payload = JSON.stringify({
          fileContent,
          fileType,
          tenentId: this.tenentId
        });

        console.log('Invoking Lambda function...');
        const invokeCommand = new InvokeCommand({
          FunctionName: 'batchAddSuppliers',
          Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
        });

        const lambdaResponse = await lambdaClient.send(invokeCommand);
        console.log('Lambda function invoked successfully.');
        console.log('Raw Lambda response:', lambdaResponse);

        let responseBody;
        try {
          responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
          console.log('Parsed Lambda response:', responseBody);
        } catch (parseError) {
          console.error('Error parsing Lambda response:', parseError);
          console.log('Raw response payload:', new TextDecoder().decode(lambdaResponse.Payload));
          throw new Error('Failed to parse Lambda response');
        }

        if (responseBody && responseBody.statusCode === 201) {
          this.snackBar.open('Suppliers uploaded successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(true);
        } else {
          const errorMessage = responseBody ? responseBody.body : 'Unknown error occurred';
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('Error uploading suppliers:', error);
        if (error instanceof Error) {
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
        this.snackBar.open('Error uploading suppliers: ' + (error instanceof Error ? error.message : String(error)), 'Close', { duration: 5000 });
      } finally {
        this.uploading = false;
      }
    } else {
      this.snackBar.open('Please select a file and ensure user information is loaded', 'Close', { duration: 3000 });
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

  downloadSampleFile(fileType: string) {
    const fileName = fileType === 'csv' ? 'sample_suppliers.csv' : 'sample_suppliers.xlsx';
    const fileContent = this.getSampleFileContent(fileType);
    const blob = new Blob([fileContent], { type: fileType === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }

  private getSampleFileContent(fileType: string): string {
      return `company_name,contact_name,contact_email,phone_number,street,city,state_province,postal_code,country
Acme Inc.,John Doe,john@acme.com,123-456-7890,123 Main St,Anytown,CA,12345,USA
Global Tech,Jane Smith,jane@globaltech.com,987-654-3210,456 Oak Ave,Metropolis,NY,67890,USA`;

  }
}