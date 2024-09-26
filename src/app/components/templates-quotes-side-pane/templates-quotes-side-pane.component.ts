import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TemplateQuoteModalComponent } from '../template-quote-modal/template-quote-modal.component';
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { confirmDialogComponent } from './confirm-dialog.component';

interface TemplateQuote {
  orderTemplateID: string;
  templateName: string;
  orderFrequency: string;
  autoSubmitOrder: boolean;
  submissionDeadlineDays: number;
  items: { ItemSKU: string; quantity: number }[];
  suppliers: { company_name: string; supplierID: string }[];
}

@Component({
  selector: 'app-templates-quotes-side-pane',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatAutocompleteModule,
    MatTooltipModule
  ],
  templateUrl: './templates-quotes-side-pane.component.html',
  styleUrls: ['./templates-quotes-side-pane.component.css']
})
export class TemplatesQuotesSidePaneComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();

  sortedTemplates: TemplateQuote[] = [];
  paneWidth = 800;
  private resizing = false;
  searchQuery: string = '';
  filteredOptions: string[] = [];

  templates: TemplateQuote[] = [];

    close() {
        this.closed.emit();
    }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      this.sortedTemplates = [...this.templates];
    }
  }

  async ngOnInit() {
    await this.fetchTemplates();
  }

  async fetchTemplates() {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'getOrderTemplates',
        Payload: new TextEncoder().encode(JSON.stringify({ body: JSON.stringify({ tenentId }) })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        this.templates = JSON.parse(responseBody.body);
        this.sortedTemplates = [...this.templates];
      } else {
        console.error('Error fetching order templates:', responseBody.body);
        this.snackBar.open('Error fetching order templates', 'Close', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
      this.snackBar.open('Error fetching order templates', 'Close', { duration: 3000 });
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

  close() {
    this.closed.emit();
  }

  onSearch() {
    this.sortedTemplates = this.templates.filter(template =>
      template.templateName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.updateFilteredOptions();
  }

  private updateFilteredOptions() {
    const allValues = this.templates.flatMap(template => [template.templateName]);
    const uniqueValues = Array.from(new Set(allValues));
    this.filteredOptions = uniqueValues.filter(value =>
      value.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openTemplateQuoteModal(template?: TemplateQuote) {
    const dialogRef = this.dialog.open(TemplateQuoteModalComponent, {
      width: '600px',
      maxWidth: '600px',
      data: { templateDetails: template }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fetchTemplates(); // Refresh the templates list
      }
    });
  }

  addNewTemplate(templateData: any) {

  }


  removeTemplate(templateId: string) {
    const dialogRef = this.dialog.open(confirmDialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to delete this template?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteTemplate(templateId);
      }
    });
  }

  async deleteTemplate(templateId: string) {
    try {
      const session = await fetchAuthSession();
      const tenentId = await this.getTenentId(session);

      const lambdaClient = new LambdaClient({
        region: outputs.auth.aws_region,
        credentials: session.credentials,
      });

      const invokeCommand = new InvokeCommand({
        FunctionName: 'deleteOrderTemplate',
        Payload: new TextEncoder().encode(JSON.stringify({ 
          queryStringParameters: { 
            tenentId: tenentId, 
            orderTemplateID: templateId 
          } 
        })),
      });

      const lambdaResponse = await lambdaClient.send(invokeCommand);
      const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

      if (responseBody.statusCode === 200) {
        this.snackBar.open('Template deleted successfully', 'Close', { 
          duration: 6000, // 6 seconds
          verticalPosition: 'top', // Position at the top
          horizontalPosition: 'center' // Position in the center
        });
        this.fetchTemplates(); 
      } else {
        console.error('Error deleting template:', responseBody.body);
        this.snackBar.open('Error deleting template', 'Close', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      this.snackBar.open('Error deleting template', 'Close', { duration: 3000 });
    }
  }


  startResize(event: MouseEvent) {
    this.resizing = true;
    event.preventDefault();
    document.addEventListener('mousemove', this.resize);
    document.addEventListener('mouseup', this.stopResize);
  }

  private resize = (event: MouseEvent) => {
    if (this.resizing) {
      const newWidth = window.innerWidth - event.clientX;
      if (newWidth > 400 && newWidth < 1200) {
        this.paneWidth = newWidth;
      }
    }
}
