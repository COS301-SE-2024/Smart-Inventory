import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const supplier = {
      supplierID: crypto.randomUUID(),
      tenentId: event.tenentId,
      company_name: event.company_name,
      contact_name: event.contact_name,
      contact_email: event.contact_email,
      phone_number: event.phone_number,
      address: {
        street: event.address?.street || '',
        city: event.address?.city || '',
        state_province: event.address?.state_province || '',
        postal_code: event.address?.postal_code || '',
        country: event.address?.country || '',
      },
    };

    const params = {
      TableName: 'suppliers',
      Item: supplier,
    };

    await ddbDocClient.send(new PutCommand(params));

    return {
      statusCode: 201,
      body: JSON.stringify(supplier),
    };
  } catch (error) {
    console.error('Error adding supplier:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};