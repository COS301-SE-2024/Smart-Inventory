import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDB();

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing request body' }),
      };
    }

    const requestBody = JSON.parse(event.body);
    const { supplierID, tenentId } = requestBody;

    if (!supplierID || !tenentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const params = {
      TableName: 'suppliers',
      Key: {
        supplierID: { S: supplierID },
        tenentId: { S: tenentId }
      }
    };

    await dynamoDB.deleteItem(params);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Supplier deleted successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};