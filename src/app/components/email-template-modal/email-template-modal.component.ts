import { Component, Inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';

@Component({
  selector: 'app-email-template-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './email-template-modal.component.html',
  styleUrls: ['./email-template-modal.component.css']
})
export class EmailTemplateModalComponent implements OnInit {
  isLoading = true;
  isSaving = false;
  emailForm: FormGroup;
  WEB_FORM_URL = '{{WEB_FORM_URL}}';
  SUPPLIER_NAME = '{{SUPPLIER_NAME}}';
  defaultEmailBody = `Dear ${this.SUPPLIER_NAME},

We are requesting a quote for our order. Please use the following unique link to submit your quote:
${this.WEB_FORM_URL}

Thank you for your prompt attention to this matter.

Best regards`;

  @ViewChild('emailBodyTextarea') emailBodyTextarea?: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<EmailTemplateModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.emailForm = this.fb.group({
      emailBody: ['', [Validators.required, this.webFormUrlValidator]]
    });
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      const existingTemplate = await this.getEmailTemplate();
      if (existingTemplate) {
        this.emailForm.patchValue({ emailBody: existingTemplate.emailBody });
      } else {
        this.emailForm.patchValue({ emailBody: this.defaultEmailBody });
      }
    } catch (error) {
      console.error('Error fetching email template:', error);
      this.emailForm.patchValue({ emailBody: this.defaultEmailBody });
    } finally {
      this.isLoading = false;
    }
  }

  async onSave() {
    if (this.emailForm.valid) {
      this.isSaving = true;
      try {
        const savedTemplate = await this.saveEmailTemplate(this.emailForm.value.emailBody);
        this.showSuccessNotification();
        this.dialogRef.close(savedTemplate);
      } catch (error) {
        console.error('Error saving email template:', error);
        this.showErrorNotification(error);
      } finally {
        this.isSaving = false;
      }
    }
  }

  webFormUrlValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value || !value.includes('{{WEB_FORM_URL}}')) {
      return { 'noWebFormUrl': true };
    }
    return null;
  }

  onCancel() {
    this.dialogRef.close();
  }

  getPreviewContent(): string {
    return this.emailForm.get('emailBody')?.value || '';
  }

  async invokeLambda(httpMethod: string, payload: any = {}) {
    const session = await fetchAuthSession();
    const tenentId = await this.getTenentId(session);

    const lambdaClient = new LambdaClient({
      region: outputs.auth.aws_region,
      credentials: session.credentials,
    });

    const invokeCommand = new InvokeCommand({
      FunctionName: 'addEmailTemplate', 
      Payload: new TextEncoder().encode(JSON.stringify({
        httpMethod,
        queryStringParameters: { tenentId },
        body: JSON.stringify({ ...payload, tenentId })
      })),
    });

    const lambdaResponse = await lambdaClient.send(invokeCommand);
    return JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  }

  async getEmailTemplate() {
    try {
      const response = await this.invokeLambda('GET');

      if (response.statusCode === 200) {
        return JSON.parse(response.body);
      } else if (response.statusCode === 404) {
        return null;
      } else {
        throw new Error(response.body || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error fetching email template:', error);
      throw error;
    }
  }

  async saveEmailTemplate(emailBody: string) {
    try {
      const response = await this.invokeLambda('POST', { emailBody });

      if (response.statusCode === 200 || response.statusCode === 201) {
        console.log('Email template saved successfully');
        return JSON.parse(response.body);
      } else {
        throw new Error(response.body || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error saving email template:', error);
      throw error;
    }
  }

  async getTenentId(session: any): Promise<string> {
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
      throw new Error('TenentId not found in user attributes');
    }

    return tenentId;
  }

  showSuccessNotification() {
    this.snackBar.open('Email template updated successfully', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  showErrorNotification(error: any) {
    this.snackBar.open(`Error updating email template: ${error.message}`, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  insertPlaceholder(placeholder: string) {
    if (this.emailBodyTextarea) {
      const textarea: HTMLTextAreaElement = this.emailBodyTextarea.nativeElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      textarea.value = `${before}${placeholder}${after}`;
      textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
      textarea.focus();
      this.emailForm.patchValue({ emailBody: textarea.value });
    }
  }

  insertSupplierName() {
    this.insertPlaceholder(this.SUPPLIER_NAME);
  }

  insertWebFormUrl() {
    this.insertPlaceholder(this.WEB_FORM_URL);
  }
}