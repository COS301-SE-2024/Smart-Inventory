import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (!event.pathParameters || !event.pathParameters.tenentId || !event.pathParameters.quoteID) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing required path parameters 'tenentId' or 'quoteID'" }),
      };
    }

    const { tenentId, quoteID } = event.pathParameters;
    
    // Query generatedQuoteItems table
    const quoteItemsParams = {
      TableName: 'generatedQuoteItems',
      KeyConditionExpression: 'QuoteID = :quoteId',
      ExpressionAttributeValues: { ':quoteId': quoteID },
    };
    
    const { Items: quoteItems } = await ddbDocClient.send(new QueryCommand(quoteItemsParams));
    
    if (!quoteItems || quoteItems.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Quote items not found' }),
      };
    }

    // Fetch corresponding inventory items
    const inventoryParams = {
      RequestItems: {
        'inventory': {
          Keys: quoteItems.map(item => ({
            inventoryID: item.inventoryID,
            tenentId: tenentId
          }))
        }
      }
    };

    const { Responses } = await ddbDocClient.send(new BatchGetCommand(inventoryParams));
    const inventoryItems = Responses.inventory;

    // Combine quote items with inventory data
    const combinedItems = quoteItems.map(quoteItem => {
      const inventoryItem = inventoryItems.find(invItem => invItem.inventoryID === quoteItem.inventoryID);
      return {
        ...quoteItem,
        UPC: inventoryItem ? inventoryItem.upc : 'N/A',
        Description: inventoryItem ? inventoryItem.description : 'N/A',
        Category: inventoryItem ? inventoryItem.category : 'N/A',
        LowStockThreshold: inventoryItem ? inventoryItem.lowStockThreshold : 'N/A',
        ReorderAmount: inventoryItem ? inventoryItem.reorderAmount : 'N/A'
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(combinedItems),
    };

  } catch (error) {
    console.error('Error getting quote items:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};