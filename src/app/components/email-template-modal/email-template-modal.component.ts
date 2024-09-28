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
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { LoadingSpinnerComponent } from '../loader/loading-spinner.component';
import { OrdersService } from '../../../../amplify/services/orders.service';

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
    private snackBar: MatSnackBar,
    private ordersService: OrdersService
  ) {
    this.emailForm = this.fb.group({
      emailBody: ['', [Validators.required, this.webFormUrlValidator]]
    });
  }

  async ngOnInit() {
    this.isLoading = true;
    try {
      const tenentId = await this.getTenentId();
      const existingTemplate = await this.getEmailTemplate(tenentId);
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
        const tenentId = await this.getTenentId();
        const savedTemplate = await this.saveEmailTemplate(tenentId, this.emailForm.value.emailBody);
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

  async getEmailTemplate(tenentId: string) {
    try {
      const response = await this.ordersService.getEmailTemplate(tenentId).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching email template:', error);
      throw error;
    }
  }

  async saveEmailTemplate(tenentId: string, emailBody: string) {
    try {
      const response = await this.ordersService.saveEmailTemplate(tenentId, emailBody).toPromise();
      console.log('Email template saved successfully');
      return response;
    } catch (error) {
      console.error('Error saving email template:', error);
      throw error;
    }
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

  async getTenentId(): Promise<string> {
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
      throw new Error('TenentId not found in user attributes');
    }

    return tenentId;
  }
}