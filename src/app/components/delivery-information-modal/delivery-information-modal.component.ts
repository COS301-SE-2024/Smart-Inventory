import { Component, Inject } from '@angular/core';
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
    MatButtonModule
  ],
  templateUrl: './delivery-information-modal.component.html',
  styleUrl: './delivery-information-modal.component.css'
})
export class DeliveryInformationModalComponent {
  deliveryForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<DeliveryInformationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { deliveryAddress: DeliveryAddress },
    private fb: FormBuilder
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
          deliveryInfoID: uuidv4(),
          tenentId: tenentId,
        };

        const invokeCommand = new InvokeCommand({
          FunctionName: 'addDeliveryInfo',
          Payload: new TextEncoder().encode(JSON.stringify(deliveryInfo)),
        });

        const lambdaResponse = await lambdaClient.send(invokeCommand);
        const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

        if (responseBody.statusCode === 201) {
          console.log('Delivery information added successfully');
          this.dialogRef.close(deliveryInfo);
        } else {
          throw new Error(responseBody.body);
        }
      } catch (error) {
        console.error('Error adding delivery information:', error);
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