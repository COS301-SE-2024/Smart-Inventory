import { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminUpdateUserAttributesCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

export const handler: PostConfirmationTriggerHandler = async (event) => {
  const { userName, userPoolId } = event;

  // Add user to group
  const addToGroupCommand = new AdminAddUserToGroupCommand({
    GroupName: process.env.GROUP_NAME,
    Username: userName,
    UserPoolId: userPoolId,
  });
  await client.send(addToGroupCommand);

  // Get existing user attributes
  const getUserCommand = new AdminGetUserCommand({
    Username: userName,
    UserPoolId: userPoolId,
  });
  const userResponse = await client.send(getUserCommand);

  // Check if tenentId already exists
  const existingTenentId = userResponse.UserAttributes?.find(
    attr => attr.Name === 'custom:tenentId'
  )?.Value;

  let tenentId = existingTenentId;

  // If tenentId doesn't exist, generate a new one
  if (!tenentId) {
    tenentId = generateUniqueValue();

    // Update the custom attribute with the new tenentId
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
  }

  return event;
};

function generateUniqueValue() {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(7);
  return `${timestamp}-${randomString}`;
}