import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';
import { templateQuoteModalComponent } from '../template-quote-modal/template-quote-modal.component';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialogTitle,
    MatDialogContent,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    template: ` <h2 mat-dialog-title>Confirm Deletion</h2>
        <mat-dialog-content>
            Are you sure you want to remove the template "{{ data.templateName }}"?
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button [mat-dialog-close]="false">Cancel</button>
            <button mat-button [mat-dialog-close]="true" color="warn">Delete</button>
        </mat-dialog-actions>`,
})
export class ConfirmationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { templateName: string },
    ) {}
}
@Component({
    selector: 'app-templates-quotes-side-pane',
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatDialogTitle,
        MatDialogContent,
        templateQuoteModalComponent,
    ],
    templateUrl: './templates-quotes-side-pane.component.html',
    styleUrls: ['./templates-quotes-side-pane.component.css'],
})
export class TemplatesQuotesSidePaneComponent implements OnChanges {
    [x: string]: any;
    @Input() isOpen: boolean = false;
    @Input() selectedOrder: any;
    @Output() closed = new EventEmitter<void>();
    @Output() quoteAccepted = new EventEmitter<void>();

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
    ) {}

    templates: { [key: string]: any } = {
        template1: {
            title: 'Amazon',
            subtitle: 'Order to be Automated',
            frequency: '01/01/2002',
            items: '10',
            Delivery_Date: 'IDk',
        },
    };

    openTemplateQuoteModal() {
        const dialogRef = this.dialog.open(templateQuoteModalComponent, {
            width: '500px',
            data: {}, // You can pass data to the modal if needed
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result && result.action === 'createOrder') {
                // Create a new template card
                const newTemplateKey = `template${Object.keys(this.templates).length + 1}`;
                this.templates[newTemplateKey] = {
                    title: result.data.title,
                    subtitle: 'Order to be Automated',
                    frequency: result.data.frequency,
                    items: result.data.items.length,
                    supplier: result.data.supplier,
                    Delivery_Date: this.calculateNextDeliveryDate(result.data.frequency),
                };

                this.snackBar.open('New template created successfully', 'Close', {
                    duration: 3000,
                });
            }
        });
    }

    calculateNextDeliveryDate(frequency: string): string {
        const today = new Date();
        let nextDate = new Date(today);

        switch (frequency) {
            case 'Weekly':
                nextDate.setDate(today.getDate() + 7);
                break;
            case 'Monthly':
                nextDate.setMonth(today.getMonth() + 1);
                break;
            case 'Quarterly':
                nextDate.setMonth(today.getMonth() + 3);
                break;
            case 'Yearly':
                nextDate.setFullYear(today.getFullYear() + 1);
                break;
        }

        return nextDate.toISOString().split('T')[0]; // Returns date in YYYY-MM-DD format
    }

    removeTemplate(key: string): void {
        const templateName = this.templates[key]?.title || 'Unknown';
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '250px',
            data: { templateName: templateName },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (this.templates[key]) {
                    delete this.templates[key];
                    this.snackBar.open(`Template "${templateName}" removed successfully`, 'Close', {
                        duration: 3000,
                    });
                }
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {}

    close() {
        this.closed.emit();
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

    viewTemplateDetails() {}
}
