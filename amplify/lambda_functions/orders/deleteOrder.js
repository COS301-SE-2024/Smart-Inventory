import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const { tenentId, orderId, quoteId } = event.pathParameters;

    // Query for the order to get the Order_Date (sort key)
    const orderParams = {
      TableName: 'orders',
      KeyConditionExpression: 'Order_ID = :orderId',
      ExpressionAttributeValues: {
        ':orderId': orderId
      }
    };
    
    const orderResult = await ddbDocClient.send(new QueryCommand(orderParams));
    
    if (!orderResult.Items || orderResult.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Order not found' })
      };
    }

    const orderDate = orderResult.Items[0].Order_Date;

    // Delete order
    await ddbDocClient.send(new DeleteCommand({
      TableName: 'orders',
      Key: {
        Order_ID: orderId,
        Order_Date: orderDate
      }
    }));

    // Delete associated quote items
    const quoteItemsParams = {
      TableName: 'generatedQuoteItems',
      KeyConditionExpression: 'QuoteID = :quoteId',
      ExpressionAttributeValues: {
        ':quoteId': quoteId
      }
    };
    
    const quoteItems = await ddbDocClient.send(new QueryCommand(quoteItemsParams));
    
    for (const item of quoteItems.Items || []) {
      await ddbDocClient.send(new DeleteCommand({
        TableName: 'generatedQuoteItems',
        Key: {
          QuoteID: quoteId,
          ItemSKU: item.ItemSKU
        }
      }));
    }

    // Delete associated quote suppliers
    const quoteSuppliersParams = {
      TableName: 'generatedQuoteSuppliers',
      KeyConditionExpression: 'QuoteID = :quoteId',
      ExpressionAttributeValues: {
        ':quoteId': quoteId
      }
    };
    
    const quoteSuppliers = await ddbDocClient.send(new QueryCommand(quoteSuppliersParams));
    
    for (const supplier of quoteSuppliers.Items || []) {
      await ddbDocClient.send(new DeleteCommand({
        TableName: 'generatedQuoteSuppliers',
        Key: {
          QuoteID: quoteId,
          Supplier: supplier.Supplier
        }
      }));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Order and associated data deleted successfully' })
    };
  } catch (error) {
    console.error('Error deleting order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};