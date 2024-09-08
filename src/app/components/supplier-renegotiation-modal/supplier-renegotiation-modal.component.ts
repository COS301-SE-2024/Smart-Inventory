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


@Component({
  selector: 'app-supplier-renegotiation-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './supplier-renegotiation-modal.component.html',
  styleUrls: ['./supplier-renegotiation-modal.component.css']
})
export class SupplierRenegotiationModalComponent implements OnInit {
  renegotiationForm: FormGroup;
  WEB_FORM_URL = '{{WEB_FORM_URL}}';

  @ViewChild('emailBodyTextarea') emailBodyTextarea?: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<SupplierRenegotiationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.renegotiationForm = this.fb.group({
      subject: ['', Validators.required],
      emailBody: ['', [Validators.required, this.webFormUrlValidator]]
    });
  }

  ngOnInit() {
    const defaultSubject = `Renegotiation Request for Quote`;
    const defaultEmailBody = `Dear ${this.data.supplierName},

We would like to request a renegotiation for the quote. Please review our request and submit an updated quote using the following link:

${this.WEB_FORM_URL}

We look forward to your response and continuing our business relationship.

Best regards,
[Your Name]`;

    this.renegotiationForm.patchValue({
      subject: defaultSubject,
      emailBody: defaultEmailBody
    });
  }

  webFormUrlValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value || !value.includes('{{WEB_FORM_URL}}')) {
      return { 'noWebFormUrl': true };
    }
    return null;
  }

  async onSend() {

    const session = await fetchAuthSession();
    
    if (this.renegotiationForm.valid) {
      try {
        const emailData = {
          supplierEmail: this.data.supplierEmail,
          emailBody: this.renegotiationForm.get('emailBody')?.value,
          quoteId: this.data.quoteId,
          orderId: this.data.orderId,
          supplierName: this.data.supplierName,
          tenentId: await this.getTenentId(session),
          supplierID: this.data.supplierID
        };

        console.log(emailData);
  
        const success = await this.sendRenegotiationEmail(emailData);
        if (success) {
          this.dialogRef.close({ action: 'renegotiationSent' });
          this.snackBar.open('Renegotiation email sent successfully', 'Close', {
            duration: 3000, // Duration in milliseconds
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });
        }
      } catch (error) {
        console.error('Error in onSend:', error);
        this.snackBar.open('Failed to send renegotiation email', 'Close', {
          duration: 3000, // Duration in milliseconds
          horizontalPosition: 'center',
          verticalPosition: 'top',
      });
      }
    }
  }

  async sendRenegotiationEmail(emailData: any) {
    try {
      const session = await fetchAuthSession();
      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });
  
      const invokeCommand = new InvokeCommand({
        FunctionName: 'sendRenegotiationEmail',
        Payload: new TextEncoder().encode(JSON.stringify(emailData)),
      });
  
      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
  
      if (responseBody.statusCode === 200) {
        console.log('Renegotiation email sent successfully:', responseBody.body);
        return true;
      } else {
        throw new Error(`Failed to send renegotiation email: ${responseBody.body}`);
      }
    } catch (error) {
      console.error('Error sending renegotiation email:', error);
      throw error;
    }
  }

  onCancel() {
    this.dialogRef.close('cancelled');
  }

  getPreviewContent(): string {
    return `Subject: ${this.renegotiationForm.get('subject')?.value || ''}

${this.renegotiationForm.get('emailBody')?.value || ''}`;
  }

  showSuccessNotification() {
    this.snackBar.open('Renegotiation email sent successfully', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  insertWebFormUrl() {
    if (this.emailBodyTextarea) {
      const textarea: HTMLTextAreaElement = this.emailBodyTextarea.nativeElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      textarea.value = `${before}${this.WEB_FORM_URL}${after}`;
      textarea.selectionStart = textarea.selectionEnd = start + this.WEB_FORM_URL.length;
      textarea.focus();
      this.renegotiationForm.patchValue({ emailBody: textarea.value });
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

    console.log(tenentId);

    return tenentId;
  }

}