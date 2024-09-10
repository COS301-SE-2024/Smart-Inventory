import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { MatDialog } from '@angular/material/dialog';
import { RoleChangeConfirmationDialogComponent } from './role-change-confirmation-dialog.component';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import {
    AdminRemoveUserFromGroupCommand,
    AdminAddUserToGroupCommand,
    CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';
import { fetchAuthSession } from 'aws-amplify/auth';
import outputs from '../../../../amplify_outputs.json';

@Component({
    selector: 'app-role-select-cell-editor',
    standalone: true,
    imports: [CommonModule, MatMenuModule, MatButtonModule],
    template: `
        <button mat-stroked-button [matMenuTriggerFor]="roleMenu" class="role-button">
            {{ value }}
        </button>
        <mat-menu #roleMenu="matMenu">
            <button mat-menu-item *ngFor="let role of roles" (click)="onRoleChange(role)">
                {{ role }}
            </button>
        </mat-menu>
    `,
    styles: [
        `
            .role-button {
                border-radius: 0;
                border: none;
                width: 100%;
                color: #000;
                font-weight: inherit;
                font-size: inherit;
                text-align: left;
                justify-content: flex-start;
                padding-left: 5px;
            }
        `,
    ],
})
export class RoleSelectCellEditorComponent implements ICellRendererAngularComp {
    private params!: ICellRendererParams;
    public value!: string;
    public roles: string[] = ['Admin', 'End User', 'Inventory Controller'];

    constructor(private dialog: MatDialog) {}

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = this.params.value;
    }

    refresh(params: ICellRendererParams): boolean {
        this.params = params;
        this.value = this.params.value;
        return true;
    }

    getValue(): string {
        return this.value;
    }

    async onRoleChange(newRole: string): Promise<void> {
        if (newRole !== this.value) {
            const oldRole = this.value;  // Store the old role before changing
            const dialogRef = this.dialog.open(RoleChangeConfirmationDialogComponent, {
                width: '350px',
                data: {
                    given_name: this.params.data.given_name,
                    family_name: this.params.data.family_name,
                    email: this.params.data.email,
                    oldRole: oldRole,
                    newRole: newRole,
                },
            });
    
            dialogRef.afterClosed().subscribe(async (result) => {
                if (result) {
                    try {
                        const session = await fetchAuthSession();
                        const client = new CognitoIdentityProviderClient({
                            region: outputs.auth.aws_region,
                            credentials: session.credentials,
                        });
    
                        // Remove user from the current group
                        const removeFromGroupCommand = new AdminRemoveUserFromGroupCommand({
                            GroupName: oldRole.toLowerCase().replace(' ', ''),
                            Username: this.params.data.email,
                            UserPoolId: outputs.auth.user_pool_id,
                        });
                        await client.send(removeFromGroupCommand);
    
                        // Add user to the new group
                        const addToGroupCommand = new AdminAddUserToGroupCommand({
                            GroupName: newRole.toLowerCase().replace(' ', ''),
                            Username: this.params.data.email,
                            UserPoolId: outputs.auth.user_pool_id,
                        });
                        await client.send(addToGroupCommand);
    
                        console.log(`User role changed from ${oldRole} to ${newRole}`);
                        this.value = newRole;  // Update the value after successful change
                        this.params.api.stopEditing();
    
                        // Create notification
                        const teamComponent = this.params.context.componentParent;
                        await teamComponent.createNotification(
                            `User ${this.params.data.given_name} ${this.params.data.family_name}'s role changed from ${oldRole} to ${newRole}`,
                            'ROLE_CHANGED'
                        );
                    } catch (error) {
                        console.error('Error changing user role:', error);
                        this.params.api.stopEditing();
                    }
                } else {
                    // User cancelled, revert the change
                    this.params.api.stopEditing();
                }
            });
        }
    }
}
