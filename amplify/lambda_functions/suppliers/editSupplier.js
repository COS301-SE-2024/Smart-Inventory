import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const { supplierID, company_name, contact_name, contact_email, phone_number, address, tenentId } = JSON.parse(event.body);

    if (!supplierID || !tenentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: supplierID and tenentId' }),
      };
    }

    const updatedAt = new Date().toISOString();

    let updateExpression = 'set updatedAt = :u';
    let expressionAttributeValues = {
      ':u': updatedAt,
    };

    if (company_name !== undefined) {
      updateExpression += ', company_name = :cn';
      expressionAttributeValues[':cn'] = company_name;
    }
    if (contact_name !== undefined) {
      updateExpression += ', contact_name = :ctn';
      expressionAttributeValues[':ctn'] = contact_name;
    }
    if (contact_email !== undefined) {
      updateExpression += ', contact_email = :ce';
      expressionAttributeValues[':ce'] = contact_email;
    }
    if (phone_number !== undefined) {
      updateExpression += ', phone_number = :pn';
      expressionAttributeValues[':pn'] = phone_number;
    }
    if (address !== undefined) {
      updateExpression += ', address = :a';
      expressionAttributeValues[':a'] = address;
    }

    const params = {
      TableName: 'suppliers',
      Key: {
        supplierID: supplierID,
        tenentId: tenentId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    console.log('Updating supplier with parameters:', JSON.stringify(params));

    const { Attributes } = await ddbDocClient.send(new UpdateCommand(params));
    console.log('Updated supplier:', JSON.stringify(Attributes));
    return {
      statusCode: 200,
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error('Error updating supplier:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};