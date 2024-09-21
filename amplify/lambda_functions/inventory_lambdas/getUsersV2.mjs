import { CognitoIdentityProviderClient, ListUsersCommand, AdminListGroupsForUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognitoClient = new CognitoIdentityProviderClient();

export const handler = async (event, context) => {
    // Retrieve the user pool ID and desired tenentId from the event payload
    const userPoolId = event.userPoolId;
    const desiredTenentId = event.tenentId;
    
    // Initialize variables
    let users = [];
    let paginationToken = null;
    
    // Retrieve users in batches
    while (true) {
        // Call the listUsers function
        const listUsersParams = {
            UserPoolId: userPoolId,
            ...(paginationToken && { PaginationToken: paginationToken })
        };
        const response = await cognitoClient.send(new ListUsersCommand(listUsersParams));
        
        // Filter users based on tenentId
        const filteredUsers = response.Users.filter(user => 
            user.Attributes.some(attr => attr.Name === 'custom:tenentId' && attr.Value === desiredTenentId)
        );
        
        // Retrieve user groups for each filtered user
        for (const user of filteredUsers) {
            let userGroups = [];
            let groupPaginationToken = null;
            
            while (true) {
                // Call the adminListGroupsForUser function
                const listGroupsParams = {
                    Username: user.Username,
                    UserPoolId: userPoolId,
                    ...(groupPaginationToken && { NextToken: groupPaginationToken })
                };
                const groupResponse = await cognitoClient.send(new AdminListGroupsForUserCommand(listGroupsParams));
                
                // Convert Date objects to ISO string in user groups
                groupResponse.Groups.forEach(group => {
                    if (group.CreationDate instanceof Date) {
                        group.CreationDate = group.CreationDate.toISOString();
                    }
                    if (group.LastModifiedDate instanceof Date) {
                        group.LastModifiedDate = group.LastModifiedDate.toISOString();
                    }
                });
                
                userGroups = userGroups.concat(groupResponse.Groups);
                
                if (groupResponse.NextToken) {
                    groupPaginationToken = groupResponse.NextToken;
                } else {
                    break;
                }
            }
            
            user.Groups = userGroups;
        }
        
        // Add filtered users to the list
        users = users.concat(filteredUsers);
        
        // Check if there are more users to retrieve
        if (response.PaginationToken) {
            paginationToken = response.PaginationToken;
        } else {
            break;
        }
    }
    
    // Convert Date objects to ISO string in user attributes
    users.forEach(user => {
        user.Attributes.forEach(attribute => {
            if (attribute.Value instanceof Date) {
                attribute.Value = attribute.Value.toISOString();
            }
        });
        
        if (user.UserCreateDate instanceof Date) {
            user.UserCreateDate = user.UserCreateDate.toISOString();
        }
        
        if (user.UserLastModifiedDate instanceof Date) {
            user.UserLastModifiedDate = user.UserLastModifiedDate.toISOString();
        }
    });
    
    // Return the list of filtered users with their groups
    return users;
};