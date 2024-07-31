import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { v4 as uuidv4 } from 'uuid';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface DeliveryAddress {
  company: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  instructions: string;
  contactName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-delivery-information-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './delivery-information-modal.component.html',
  styleUrl: './delivery-information-modal.component.css'
})
export class DeliveryInformationModalComponent implements OnInit {
  deliveryForm: FormGroup;
  isLoading = true;
  existingDeliveryInfoID: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<DeliveryInformationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { deliveryAddress: DeliveryAddress },
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.deliveryForm = this.fb.group({
      company: [data.deliveryAddress.company, Validators.required],
      street: [data.deliveryAddress.street, Validators.required],
      city: [data.deliveryAddress.city, Validators.required],
      state: [data.deliveryAddress.state, Validators.required],
      postalCode: [data.deliveryAddress.postalCode, Validators.required],
      country: [data.deliveryAddress.country, Validators.required],
      instructions: [data.deliveryAddress.instructions],
      contactName: [data.deliveryAddress.contactName, Validators.required],
      email: [data.deliveryAddress.email, [Validators.required, Validators.email]],
      phone: [data.deliveryAddress.phone, Validators.required]
    });
  }

  async ngOnInit() {
    await this.loadDeliveryInfo();
  }

  async loadDeliveryInfo() {
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

      const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;

      if (!tenentId) {
        throw new Error('TenantId not found in user attributes');
      }

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getDeliveryInfo',
        Payload: new TextEncoder().encode(JSON.stringify({ pathParameters: { tenentId: tenentId } })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        const deliveryInfo = JSON.parse(responseBody.body)[0]; // Assuming we're using the first entry
        if (deliveryInfo) {
          this.existingDeliveryInfoID = deliveryInfo.deliveryInfoID;
          this.deliveryForm.patchValue({
            company: deliveryInfo.companyName,
            street: deliveryInfo.street,
            city: deliveryInfo.city,
            state: deliveryInfo.state,
            postalCode: deliveryInfo.postalCode,
            country: deliveryInfo.country,
            instructions: deliveryInfo.deliveryInstructions,
            contactName: deliveryInfo.contactName,
            email: deliveryInfo.email,
            phone: deliveryInfo.phone
          });
        }
      } else if (responseBody.statusCode !== 404) {
        throw new Error(responseBody.body);
      }
    } catch (error) {
      console.error('Error loading delivery information:', error);
      // Handle the error (e.g., show an error message to the user)
    } finally {
      this.isLoading = false;
    }
  }

  async onSave() {
    if (this.deliveryForm.valid) {
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
  
        const tenentId = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value;
  
        if (!tenentId) {
          throw new Error('TenantId not found in user attributes');
        }
  
        const lambdaClient = new LambdaClient({
          region: outputs.auth.aws_region,
          credentials: session.credentials,
        });
  
        const deliveryInfo = {
          ...this.deliveryForm.value,
          deliveryInfoID: this.existingDeliveryInfoID || uuidv4(),
          tenentId: tenentId,
        };
  
        const invokeCommand = new InvokeCommand({
          FunctionName: 'updateDeliveryInfo',
          Payload: new TextEncoder().encode(JSON.stringify(deliveryInfo)),
        });
  
        const lambdaResponse = await lambdaClient.send(invokeCommand);
        const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
        if (responseBody.statusCode === 200) {
          console.log('Delivery information updated successfully');
          this.snackBar.open('Delivery information updated successfully', 'Close', {
            duration: 6000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.dialogRef.close(deliveryInfo);
        } else {
          throw new Error(responseBody.body);
        }
      } catch (error) {
        console.error('Error updating delivery information:', error);
        this.snackBar.open('Error updating delivery information', 'Close', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        // Handle the error (e.g., show an error message to the user)
      }
    }
  }



  onCancel() {
    this.dialogRef.close();
  }

  getErrorMessage(field: string): string {
    const control = this.deliveryForm.get(field);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}