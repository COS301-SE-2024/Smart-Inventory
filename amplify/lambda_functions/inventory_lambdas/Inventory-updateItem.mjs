import { DynamoDB } from '@aws-sdk/client-dynamodb';

const dynamoDB = new DynamoDB();

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

export const handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing request body' }),
    };
  }
  const { 
    inventoryID, 
    quantity, 
    tenentId, 
    expirationDate 
  } = JSON.parse(event.body);
  
  if (!inventoryID || !tenentId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields: inventoryID and tenentId' }),
    };
  }
  
  try {
    // First, get the current item from the inventory table
    const getItemParams = {
      TableName: 'inventory',
      Key: {
        inventoryID: { S: inventoryID },
        tenentId: { S: tenentId }
      }
    };
    
    const currentItem = await dynamoDB.getItem(getItemParams);
    const oldQuantity = currentItem.Item ? parseInt(currentItem.Item.quantity.N, 10) : 0;
    const sku = currentItem.Item.SKU.S;
    const oldExpirationDate = currentItem.Item ? currentItem.Item.expirationDate.S : null;
    const description = currentItem.Item.description.S;
    
    const updatedAt = new Date().toISOString();
    let updateExpression = 'set updatedAt = :u';
    let expressionAttributeValues = {
      ':u': { S: updatedAt }
    };
    
    if (quantity !== undefined) {
      const newQuantity = parseInt(quantity, 10);
      if (!isNaN(newQuantity)) {
        updateExpression += ', quantity = :q';
        expressionAttributeValues[':q'] = { N: newQuantity.toString() };
      }
    }
    if (expirationDate !== undefined) {
      updateExpression += ', expirationDate = :e';
      expressionAttributeValues[':e'] = { S: expirationDate };
    }
    
    const params = {
      TableName: 'inventory',
      Key: {
        inventoryID: { S: inventoryID },
        tenentId: { S: tenentId }
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };
    
    console.log('Updating inventory item with parameters:', JSON.stringify(params));
    
    const { Attributes } = await dynamoDB.updateItem(params);
    console.log('Updated inventory item:', JSON.stringify(Attributes));
    
    
    // Create notifications for quantity and expiration date changes
    if (Attributes.quantity && parseInt(Attributes.quantity.N, 10) !== oldQuantity) {
      const message = `Quantity updated for ${description} (SKU: ${sku}). New quantity: ${Attributes.quantity.N}`;
      await createNotification(tenentId, message, 'QUANTITY_UPDATE');
    }
    
    if (Attributes.expirationDate && Attributes.expirationDate.S !== oldExpirationDate) {
      const message = `Expiration date updated for ${description} (SKU: ${sku}). New date: ${Attributes.expirationDate.S}`;
      await createNotification(tenentId, message, 'EXPIRATION_DATE_UPDATE');
    }
    
    // Update InventorySummary table
    if (Attributes.quantity) {
      const newQuantity = parseInt(Attributes.quantity.N, 10);
      
      const getSummaryParams = {
        TableName: 'inventorySummary',
        Key: {
          SKU: { S: sku },
          tenentId: { S: tenentId }
        }
      };
      
      const summaryItem = await dynamoDB.getItem(getSummaryParams);
      const currentSummaryQuantity = summaryItem.Item ? parseInt(summaryItem.Item.quantity.N, 10) : 0;
      
      const quantityDiff = newQuantity - oldQuantity;
      const newSummaryQuantity = currentSummaryQuantity + quantityDiff;
      
      const summaryParams = {
        TableName: 'inventorySummary',
        Key: {
          SKU: { S: sku },
          tenentId: { S: tenentId }
        },
        UpdateExpression: 'SET quantity = :q, updatedAt = :u',
        ExpressionAttributeValues: {
          ':q': { N: newSummaryQuantity.toString() },
          ':u': { S: updatedAt }
        },
        ReturnValues: 'ALL_NEW',
      };
      
      console.log('Updating InventorySummary item with parameters:', JSON.stringify(summaryParams));
      
      try {
        const summaryResult = await dynamoDB.updateItem(summaryParams);
        console.log('Updated InventorySummary item:', JSON.stringify(summaryResult.Attributes));
      } catch (summaryError) {
        console.error('Error updating InventorySummary item:', summaryError);
        // Note: We're not failing the whole operation if the summary update fails
      }
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};