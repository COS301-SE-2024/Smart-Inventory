import { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

// add user to group and update custom attribute
export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { userName, userPoolId, request } = event;

  // Add user to group
  const addToGroupCommand = new AdminAddUserToGroupCommand({
    GroupName: process.env.GROUP_NAME,
    Username: userName,
    UserPoolId: userPoolId,
  });
  await client.send(addToGroupCommand);

  // Generate a unique value for the custom attribute
  const tenentId = generateUniqueValue();

  // Update the custom attribute with the unique value
  const updateAttributesCommand = new AdminUpdateUserAttributesCommand({
    UserAttributes: [
      {
        Name: 'custom:tenentId',
        Value: tenentId,
      },
    ],
    Username: userName,
    UserPoolId: userPoolId,
  });
  await client.send(updateAttributesCommand);

  return event;
};

// Function to generate a unique value
function generateUniqueValue() {
  // Implement your logic to generate a unique value
  // For example, you can use a combination of timestamp and random string
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(7);
  return `${timestamp}-${randomString}`;
}