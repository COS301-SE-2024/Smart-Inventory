import { Component, OnInit, ViewChild } from '@angular/core';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminAddUserToGroupCommand,
    GetUserCommand,
    AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import outputs from '../../../../amplify_outputs.json';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { GridComponent } from '../../components/grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { TitleService } from '../../components/header/title.service';
import { DeleteButtonRendererComponent } from './delete-button-renderer.component';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RoleChangeConfirmationDialogComponent } from './role-change-confirmation-dialog.component';
import { RoleSelectCellEditorComponent } from './role-select-cell-editor.component';
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';

@Component({
    selector: 'app-team',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        GridComponent,
        DeleteButtonRendererComponent,
        MatDialogModule,
        MatButtonModule,
        RoleChangeConfirmationDialogComponent,
        RoleSelectCellEditorComponent,
        LoadingSpinnerComponent,
    ],
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.css'],
})
export class TeamComponent implements OnInit {
    constructor(private titleService: TitleService, private dialog: MatDialog) {}
    showPopup = false;
    user = {
        name: '',
        surname: '',
        email: '',
        role: '',
    };

    @ViewChild('gridComponent') gridComponent!: GridComponent;

    addButton = { text: 'Add Member' };
    isLoading = true;
    rowData: any[] = [];
    colDefs: ColDef[] = [
        { field: 'given_name', headerName: 'Name' },
        { field: 'family_name', headerName: 'Surname' },
        { field: 'email', headerName: 'Email' },
        {
            field: 'role',
            headerName: 'Role',
            cellRenderer: RoleSelectCellEditorComponent,
            width: 100,
        },
        {
            headerName: 'Remove Member',
            cellRenderer: DeleteButtonRendererComponent,
            width: 100,
        },
    ];

    openAddMemberPopup() {
        this.showPopup = true;
    }

    closePopup() {
        this.showPopup = false;
    }

    onCellValueChanged(event: any) {
        if (event.column.colId === 'role') {
            const dialogRef = this.dialog.open(RoleChangeConfirmationDialogComponent, {
                width: '350px',
                data: {
                    given_name: event.data.given_name,
                    family_name: event.data.family_name,
                    email: event.data.email,
                    newRole: event.newValue,
                },
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    // User confirmed, proceed with the change
                    console.log('Role change confirmed');
                    // Here you would typically update the backend
                } else {
                    // User cancelled, revert the change
                    event.node.setDataValue('role', event.oldValue);
                }
            });
        }
    }

    async onNameCellValueChanged(event: any) {
        if (event.column.colId === 'given_name' || event.column.colId === 'family_name') {
            try {
                const session = await fetchAuthSession();

                const client = new CognitoIdentityProviderClient({
                    region: outputs.auth.aws_region,
                    credentials: session.credentials,
                });

                const updateUserAttributesCommand = new AdminUpdateUserAttributesCommand({
                    UserPoolId: outputs.auth.user_pool_id,
                    Username: event.data.email,
                    UserAttributes: [
                        {
                            Name: event.column.colId,
                            Value: event.newValue,
                        },
                    ],
                });

                await client.send(updateUserAttributesCommand);
                console.log('User attribute updated successfully');
            } catch (error) {
                console.error('Error updating user attribute:', error);
                // Revert the change in the grid
                event.node.setDataValue(event.column.colId, event.oldValue);
            }
        }
    }

    async ngOnInit() {
        this.titleService.updateTitle('Team');
        await this.fetchUsers();
    }

    async onSubmit(formData: any) {
        try {
            const session = await fetchAuthSession();

            const client = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            // Retrieve the custom attribute using GetUserCommand
            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await client.send(getUserCommand);

            const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
                (attr) => attr.Name === 'custom:tenentId'
            )?.Value;

            const createUserCommand = new AdminCreateUserCommand({
                UserPoolId: outputs.auth.user_pool_id,
                Username: formData.email,
                UserAttributes: [
                    {
                        Name: 'given_name',
                        Value: formData.name,
                    },
                    {
                        Name: 'family_name',
                        Value: formData.surname,
                    },
                    {
                        Name: 'custom:tenentId',
                        Value: adminUniqueAttribute,
                    },
                ],
            });

            const UserResponseObject = await client.send(createUserCommand);
            console.log(UserResponseObject);

            const addToGroupCommand = new AdminAddUserToGroupCommand({
                GroupName: formData.role,
                Username: UserResponseObject.User?.Username,
                UserPoolId: outputs.auth.user_pool_id,
            });
            await client.send(addToGroupCommand);

            console.log('User created and added to the group successfully');

            this.fetchUsers(); // Refresh the user list after adding a new user
            this.closePopup();
        } catch (error) {
            console.error('Error creating user and adding to group:', error);
        }
    }

    async fetchUsers() {
        console.log('hello');
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            // Retrieve the custom attribute using GetUserCommand
            const client = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await client.send(getUserCommand);

            const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
                (attr) => attr.Name === 'custom:tenentId'
            )?.Value;

            const payload = JSON.stringify({
                userPoolId: outputs.auth.user_pool_id,
                tenentId: adminUniqueAttribute,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'getUsers',
                Payload: new TextEncoder().encode(payload),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const users = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
            console.log('Users received from Lambda:', users);

            this.rowData = users.map((user: any) => ({
                given_name: user.Attributes.find((attr: any) => attr.Name === 'given_name')?.Value,
                family_name: user.Attributes.find((attr: any) => attr.Name === 'family_name')?.Value,
                email: user.Attributes.find((attr: any) => attr.Name === 'email')?.Value,
                role: user.Groups.length > 0 ? this.getRoleDisplayName(user.Groups[0].GroupName) : '',
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            this.isLoading = false;
        }
    }

    private getRoleDisplayName(roleName: string): string {
        switch (roleName) {
            case 'admin':
                return 'Admin';
            case 'enduser':
                return 'End User';
            case 'inventorycontroller':
                return 'Inventory Controller';
            default:
                return '';
        }
    }
}
