import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';
import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';
import { FormsModule } from '@angular/forms';
import { fetchAuthSession } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand, AdminUpdateUserAttributesCommand, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { CognitoIdentityClient } from '@aws-sdk/client-cognito-identity';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-provider-cognito-identity';
Amplify.configure(outputs);

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
    Amplify.configure(outputs);
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

      const client = new CognitoIdentityProviderClient({ region, credentials });


      // Retrieve the custom attribute using GetUserCommand
      const getUserCommand = new GetUserCommand({
        AccessToken: session.tokens?.accessToken.toString(),
      });
      const getUserResponse = await client.send(getUserCommand);

      const adminUniqueAttribute = getUserResponse.UserAttributes?.find(
        (attr) => attr.Name === 'custom:tenderID'
      )?.Value;
  
      console.log(adminUniqueAttribute);
      console.log(formData);

      // Create the user with AdminCreateUserCommand
      // const createUserCommand = new AdminCreateUserCommand({
      //   UserPoolId: outputs.auth.user_pool_id,
      //   Username: formData.email,
      //   UserAttributes: [
      //     {
      //       Name: 'given_name',
      //       Value: formData.name,
      //     },
      //     {
      //       Name: 'family_name',
      //       Value: formData.surname,
      //     },
      //     {
      //       Name: 'email',
      //       Value: formData.email,
      //     },    
      //   ]
      // });
      // await client.send(createUserCommand);
  
      // // Add the user to the selected group with AdminAddUserToGroupCommand
      // const addUserToGroupCommand = new AdminAddUserToGroupCommand({
      //   UserPoolId: outputs.auth.user_pool_id,
      //   Username: this.user.email,
      //   GroupName: this.user.role
      // });
      // await client.send(addUserToGroupCommand);
  
      console.log('User created and added to the group successfully');
    } catch (error) {
      console.error('Error creating user and adding to group:', error);
    }
  }
}