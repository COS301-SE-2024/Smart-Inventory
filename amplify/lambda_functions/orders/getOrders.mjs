import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    if (!event.pathParameters || !event.pathParameters.tenentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required path parameter 'tenentId'" }),
      };
    }

    const { tenentId } = event.pathParameters;
    
    const params = {
      TableName: 'orders',
      IndexName: 'tenentId-index',
      KeyConditionExpression: '#tenentId = :tenentId',
      ExpressionAttributeNames: {
        '#tenentId': 'tenentId',
      },
      ExpressionAttributeValues: {
        ':tenentId': tenentId,
      },
    };

    const { Items } = await ddbDocClient.send(new QueryCommand(params));

    if (Items && Items.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify(Items),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'No orders found for the given tenentId' }),
      };
    }
  } catch (error) {
    console.error('Error querying orders:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};