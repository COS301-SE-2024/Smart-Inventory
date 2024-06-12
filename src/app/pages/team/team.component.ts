import { Component, OnInit } from '@angular/core';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand, GetUserCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import outputs from '../../../../amplify_outputs.json';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit{
  showPopup = false;
  user = {
    name: '',
    surname: '',
    email: '',
    role: ''
  };

  users: any[] = [];

  openAddMemberPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  async ngOnInit() {
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
        ]
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
      this.users = users;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }
}