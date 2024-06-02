import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { FormsModule } from '@angular/forms';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand, AdminUpdateUserAttributesCommand, GetUserCommand, ListUsersCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
Amplify.configure(outputs);
import { signUp } from "aws-amplify/auth"

import { confirmSignUp } from 'aws-amplify/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [RouterOutlet, AmplifyAuthenticatorModule, FormsModule],
})
export class AppComponent {
  title = 'Smart-Inventory';
  user = {
    name: '',
    surname: '',
    email: '',
    role: ''
  };

  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(outputs,{ssr:true});
  }

  async onSubmit(formData: any) {
    try {
      
      const session = await  fetchAuthSession({ forceRefresh: true });
      const region = outputs.auth.aws_region; // Get the region from the Amplify configuration
      const identityPoolId = outputs.auth.identity_pool_id; // Get the Identity Pool ID from the Amplify configuration

      const identityClient = new CognitoIdentityClient({ region });
      const credentials = fromCognitoIdentityPool({
        client: identityClient,
        identityPoolId: identityPoolId,
      });

      const client = new CognitoIdentityProviderClient({
        region: "us-east-1",
        credentials: {
          accessKeyId: "",
          secretAccessKey: "",
        },
      });

      // Retrieve the custom attribute using GetUserCommand
      const getUserCommand = new GetUserCommand({
        AccessToken: session.tokens?.accessToken.toString(),
      });
      const getUserResponse = await client.send(getUserCommand);

      const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
        (attr) => attr.Name === 'custom:tenderID'
      )?.Value;
    
      // await signUp({
      //   username: formData.email,
      //   password: "passWord1!",
      //   options: {
      //     userAttributes: {
      //       email: formData.email,
      //       family_name: formData.surname, 
      //       given_name: formData.name,
      //       'custom:tenderID': adminUniqueAttribute
      //     },
      //   }
      // });

    // const addToGroupCommand = new AdminAddUserToGroupCommand({
    //   GroupName: formData.group,
    //   Username: formData.name,
    //   UserPoolId: outputs.auth.user_pool_id,
    // });
    // await client.send(addToGroupCommand);

    const listUsersCommand = new ListUsersCommand({
      UserPoolId: outputs.auth.user_pool_id,
    });

    const listUsersResponse = await client.send(listUsersCommand);
    const users = listUsersResponse.Users;

    console.log('List of users:', users);
  
      console.log('User created and added to the group successfully');
    } catch (error) {
      console.error('Error creating user and adding to group:', error);
    }
  }



}