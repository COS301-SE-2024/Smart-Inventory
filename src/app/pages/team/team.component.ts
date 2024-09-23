import { Component, OnInit, ViewChild } from '@angular/core';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminAddUserToGroupCommand,
    GetUserCommand,
    AdminUpdateUserAttributesCommand,
    AdminDeleteUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import outputs from '../../../../amplify_outputs.json';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { GridComponent } from '../../components/grid/grid.component';
import { ColDef } from 'ag-grid-community';
import { TitleService } from '../../components/header/title.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { RoleChangeConfirmationDialogComponent } from './role-change-confirmation-dialog.component';
import { RoleSelectCellEditorComponent } from './role-select-cell-editor.component';
import { LoadingSpinnerComponent } from '../../components/loader/loading-spinner.component';
import { MaterialModule } from 'app/components/material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeleteConfirmationDialogComponent } from './delete-confirmation-dialog.component';
import { TeamsService } from '../../../../amplify/services/teams.service';

@Component({
    selector: 'app-team',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        GridComponent,
        MatDialogModule,
        MatButtonModule,
        RoleChangeConfirmationDialogComponent,
        RoleSelectCellEditorComponent,
        LoadingSpinnerComponent,
        MaterialModule,
    ],
    templateUrl: './team.component.html',
    styleUrls: ['./team.component.css'],
})
export class TeamComponent implements OnInit {
    constructor(
        private titleService: TitleService,
        private teamService: TeamsService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) {}
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
        { field: 'given_name', headerName: 'Name', filter: 'agSetColumnFilter' },
        { field: 'family_name', headerName: 'Surname', filter: 'agSetColumnFilter' },
        { field: 'email', headerName: 'Email', filter: 'agSetColumnFilter' },
        {
            field: 'role',
            headerName: 'Role',
            filter: 'agSetColumnFilter',
            cellRenderer: RoleSelectCellEditorComponent,
            cellRendererParams: {
                context: this.getContext()
            },
            width: 100,
        }
    ];

    tenantId: string = '';
    userName: string = '';
    userRole: string = '';

    async ngOnInit() {
        this.titleService.updateTitle('Team');
        await this.getUserInfo();
        await this.fetchUsers();
        await this.logActivity('Viewed team', 'Team page navigated');
    }

    async getUserInfo() {
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
        
            const givenName = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'given_name')?.Value || '';
            const familyName = getUserResponse.UserAttributes?.find((attr) => attr.Name === 'family_name')?.Value || '';
            this.userName = `${givenName} ${familyName}`.trim();
        
            this.tenantId =
                getUserResponse.UserAttributes?.find((attr) => attr.Name === 'custom:tenentId')?.Value || '';
        
            // Use the TeamsService to get users
            const users = await this.teamService.getUsers(outputs.auth.user_pool_id, this.tenantId).toPromise();
        
            const currentUser = users.find(
                (user: any) =>
                    user.Attributes.find((attr: any) => attr.Name === 'email')?.Value ===
                    session.tokens?.accessToken.payload['username'],
            );
        
            if (currentUser && currentUser.Groups.length > 0) {
                this.userRole = this.getRoleDisplayName(currentUser.Groups[0].GroupName);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            // You might want to add some error handling here, such as showing an error message to the user
            this.snackBar.open('Error fetching user info', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
        }
    }

    async logActivity(task: string, details: string) {
        try {
            const session = await fetchAuthSession();

            const lambdaClient = new LambdaClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const payload = JSON.stringify({
                tenentId: this.tenantId,
                memberId: this.tenantId,
                name: this.userName,
                role: this.userRole || 'Admin',
                task: task,
                timeSpent: 0,
                idleTime: 0,
                details: details,
            });

            const invokeCommand = new InvokeCommand({
                FunctionName: 'userActivity-createItem',
                Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
            });

            const lambdaResponse = await lambdaClient.send(invokeCommand);
            const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));

            if (responseBody.statusCode === 201) {
                console.log('Activity logged successfully');
            } else {
                throw new Error(responseBody.body);
            }
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    openAddMemberPopup() {
        this.showPopup = true;
    }

    closePopup() {
        this.showPopup = false;
    }

    async onCellValueChanged(event: any) {
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

            dialogRef.afterClosed().subscribe(async (result) => {
                if (result) {
                    console.log('Role change confirmed');
                    await this.logActivity(
                        'Changed user role',
                        `Changed role for ${event.data.email} to ${event.newValue}`,
                    );
                } else {
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
                await this.logActivity(
                    'Updated user attribute',
                    `Updated ${event.column.colId} for ${event.data.email}`,
                );
            } catch (error) {
                console.error('Error updating user attribute:', error);
                event.node.setDataValue(event.column.colId, event.oldValue);
            }
        }
    }

    async onSubmit(formData: any) {
        try {
            const session = await fetchAuthSession();

            const client = new CognitoIdentityProviderClient({
                region: outputs.auth.aws_region,
                credentials: session.credentials,
            });

            const getUserCommand = new GetUserCommand({
                AccessToken: session.tokens?.accessToken.toString(),
            });
            const getUserResponse = await client.send(getUserCommand);

            const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
                (attr) => attr.Name === 'custom:tenentId',
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
            await this.logActivity('Added new team member', `Added ${formData.email} as ${formData.role}`);
            await this.createNotification(`New user ${formData.name} ${formData.surname} added as ${formData.role}`, 'USER_ADDED');

            this.fetchUsers();
            this.closePopup();
            this.snackBar.open('User created and added to the group successfully', 'Close', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
              });
        } catch (error) {
            console.error('Error creating user and adding to group:', error);
        }
    }

    async fetchUsers() {
        console.log('Fetching users');
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
    
            const tenantId = getUserResponse.UserAttributes?.find(
                (attr) => attr.Name === 'custom:tenentId'
            )?.Value || '';
    
            // Use the TeamsService to get users
            const users = await this.teamService.getUsers(outputs.auth.user_pool_id, tenantId).toPromise();
            console.log('Users received from TeamsService:', users);
            console.log('Raw response from API:', JSON.stringify(users, null, 2));
            this.rowData = users.map((user: any) => ({
                given_name: user.Attributes.find((attr: any) => attr.Name === 'given_name')?.Value,
                family_name: user.Attributes.find((attr: any) => attr.Name === 'family_name')?.Value,
                email: user.Attributes.find((attr: any) => attr.Name === 'email')?.Value,
                role: user.Groups.length > 0 ? this.getRoleDisplayName(user.Groups[0].GroupName) : '',
            }));
        } catch (error) {
            console.error('Error fetching users:', error);
            // You might want to add some error handling here, such as showing an error message to the user
            this.snackBar.open('Error fetching users', 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
            });
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

    async createNotification(message: string, type: string) {
        try {
          const session = await fetchAuthSession();
          const lambdaClient = new LambdaClient({
            region: outputs.auth.aws_region,
            credentials: session.credentials,
          });
      
          const notificationId = this.generateUUID();
          const timestamp = new Date().toISOString();
      
          const payload = JSON.stringify({
            tenentId: this.tenantId,
            timestamp: timestamp,
            notificationId: notificationId,
            type: type,
            message: message,
            isRead: false
          });
      
          const invokeCommand = new InvokeCommand({
            FunctionName: 'notification-createItem',
            Payload: new TextEncoder().encode(JSON.stringify({ body: payload })),
          });
      
          const lambdaResponse = await lambdaClient.send(invokeCommand);
          const responseBody = JSON.parse(new TextDecoder().decode(lambdaResponse.Payload));
      
          if (responseBody.statusCode === 201) {
            console.log('Notification created successfully');
            
          } else {
            throw new Error(responseBody.body);
          }
        } catch (error) {
          console.error('Error creating notification:', error);
        }
      }
      
      generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }

      getContext() {
        return { componentParent: this };
      }

      async deleteMember() {
        const selectedRows = this.gridComponent.gridApi.getSelectedRows();
        if (selectedRows.length === 0) {
          this.snackBar.open('Please select a member to delete', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          return;
        }
    
        const selectedMember = selectedRows[0];
        if (selectedMember.role === 'Admin') {
          this.snackBar.open('Admin users cannot be deleted', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          return;
        }
    
        const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
          width: '350px',
          data: {
            given_name: selectedMember.given_name,
            family_name: selectedMember.family_name,
            email: selectedMember.email,
          },
        });
    
        dialogRef.componentInstance.deleteConfirmed.subscribe(async () => {
          await this.deleteUser(selectedMember.email);
          dialogRef.close();
          this.fetchUsers();
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
    

        // Create notification
        await this.createNotification(
            `User ${email} has been deleted`,
            'USER_DELETED'
        );

        this.snackBar.open('User deleted successfully', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });

        } catch (error) {
        console.error('Error deleting user:', error);
        this.snackBar.open('Error deleting user', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
        });
        }
    }


}
