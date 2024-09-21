import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDB();

async function createNotification(tenentId, message, type) {
  const notificationId = generateUUID();
  const timestamp = new Date().toISOString();
  
  const params = {
    TableName: 'notifications',
    Item: {
      tenentId: { S: tenentId },
      timestamp: { S: timestamp },
      notificationId: { S: notificationId },
      type: { S: type },
      message: { S: message },
      isRead: { BOOL: false }
    }
  };

  await dynamoDB.putItem(params);
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    const { inventoryID, tenentId } = requestBody;
    if (!inventoryID || !tenentId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // First, get the item details from the inventory table
    const getParams = {
      TableName: 'inventory',
      Key: {
        inventoryID: { S: inventoryID },
        tenentId: { S: tenentId }
      }
    };
    const itemToDelete = await dynamoDB.getItem(getParams);

    if (!itemToDelete.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Item not found' }),
      };
    }

    const sku = itemToDelete.Item.SKU.S;
    const quantityToRemove = parseInt(itemToDelete.Item.quantity.N, 10);
    const description = itemToDelete.Item.description.S;
    const expirationDate = itemToDelete.Item.expirationDate.S;

    // Update the inventorySummary table
    const updateSummaryParams = {
      TableName: 'inventorySummary',
      Key: {
        SKU: { S: sku },
        tenentId: { S: tenentId }
      },
      UpdateExpression: 'SET quantity = quantity - :quantityChange, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':quantityChange': { N: quantityToRemove.toString() },
        ':updatedAt': { S: new Date().toISOString() },
      },
      ReturnValues: 'UPDATED_NEW'
    };
    await dynamoDB.updateItem(updateSummaryParams);

    // Delete the item from the inventory table
    const deleteParams = {
      TableName: 'inventory',
      Key: {
        inventoryID: { S: inventoryID },
        tenentId: { S: tenentId }
      }
    };
    await dynamoDB.deleteItem(deleteParams);

    // Create a notification for the deleted inventory item
    const notificationMessage = `Inventory item deleted: ${description} (SKU: ${sku}). Quantity: ${quantityToRemove}, Expiration Date: ${expirationDate}`;
    await createNotification(tenentId, notificationMessage, 'INVENTORY_ITEM_DELETED');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Item deleted successfully, inventory summary updated, and notification created' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};