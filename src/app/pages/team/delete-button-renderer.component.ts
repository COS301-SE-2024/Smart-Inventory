import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';
import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import outputs from '../../../../amplify_outputs.json';
import { fetchAuthSession } from 'aws-amplify/auth';

@Component({
    selector: 'app-delete-button-renderer',
    standalone: true,
    template: `<button class="delete-button" (click)="onDeleteButtonClick()">Delete</button>`,
    styles: [
        `
            .delete-button {
                background-color: #e0e0e0;
                color: #616161;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s ease;
                line-height: 1.2;
            }

            .delete-button:hover {
                background-color: #bdbdbd; /* Slightly darker grey on hover */
            }

            .delete-button:active {
                background-color: #757575; /* Even darker grey when clicked */
            }
        `,
    ],
})
export class DeleteButtonRenderer implements ICellRendererAngularComp {
    private params!: ICellRendererParams;

    constructor(private dialog: MatDialog) {}

    agInit(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: ICellRendererParams): boolean {
        return true;
    }

    async onDeleteButtonClick() {
        const { given_name, family_name, email } = this.params.data;
        this.openDeleteConfirmationDialog(given_name, family_name, email);
    }

    openDeleteConfirmationDialog(given_name: string, family_name: string, email: string) {
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
            width: '300px',
            data: { given_name, family_name, email },
        });

        dialogRef.componentInstance.deleteConfirmed.subscribe(async () => {
            await this.deleteUser(email);
        });
    }

    async deleteUser(email: string) {
        try {
            const session = await fetchAuthSession();

            const client = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const input = {
                UserPoolId: outputs.auth.user_pool_id,
                Username: email,
            };

            const command = new AdminDeleteUserCommand(input);
            await client.send(command);
            console.log('User deleted successfully:', email);
            this.params.api.applyTransaction({ remove: [this.params.node.data] });
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}
