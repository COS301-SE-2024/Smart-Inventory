import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Function to generate a unique ID
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export const handler = async (event) => {
  try {
    const orderData = JSON.parse(event.body);
    const orderId = generateUniqueId(); // Use your unique ID generation method
    const quoteId = generateUniqueId(); // Use your unique ID generation method

    // Create order
    const orderParams = {
      TableName: 'orders',
      Item: {
        Order_ID: orderId,
        Order_Date: orderData.Order_Date,
        Order_Status: orderData.Order_Status,
        Quote_ID: quoteId,
        Quote_Status: orderData.Quote_Status,
        Selected_Supplier: orderData.Selected_Supplier,
        Expected_Delivery_Date: orderData.Expected_Delivery_Date,
        Actual_Delivery_Date: orderData.Actual_Delivery_Date,
        tenentId: orderData.tenentId,
        Creation_Time: new Date().toISOString()
      }
    };
    await ddbDocClient.send(new PutCommand(orderParams));

    // Create quote items
    for (const item of orderData.quoteItems) {
      const quoteItemParams = {
        TableName: 'generatedQuoteItems',
        Item: {
          QuoteID: quoteId,
          ItemSKU: item.ItemSKU,
          Quantity: item.Quantity,
          tenentId: orderData.tenentId
        }
      };
      await ddbDocClient.send(new PutCommand(quoteItemParams));
    }

    // Create quote suppliers
    for (const supplier of orderData.suppliers) {
      const quoteSupplierParams = {
        TableName: 'generatedQuoteSuppliers',
        Item: {
          QuoteID: quoteId,
          Supplier: supplier,
          tenentId: orderData.tenentId
        }
      };
      await ddbDocClient.send(new PutCommand(quoteSupplierParams));
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Order created successfully', orderId, quoteId })
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
    };
  }
};