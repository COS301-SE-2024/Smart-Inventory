import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { Lambda } from '@aws-sdk/client-lambda';
import QRCode from 'qrcode';

const dynamoDB = new DynamoDB();
const lambda = new Lambda();

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


async function generateQRCode(data) {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
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
    const requestBody = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const { upc, description, category, quantity, sku, supplier, lowStockThreshold, reorderAmount, tenentId, expirationDate, unitCost, leadTime, deliveryCost, dailyDemand } = requestBody;
    if (!upc || !description || !quantity || !sku || !supplier || !tenentId || !expirationDate || !category || !reorderAmount || !lowStockThreshold ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }
    
    // Check if the SKU already exists in the inventorySummary table
    const getParams = {
      TableName: 'inventorySummary',
      Key: {
        SKU: { S: sku },
        tenentId: { S: tenentId }
      }
    };
    const existingItem = await dynamoDB.getItem(getParams);
    if (existingItem.Item) {
      // If the item exists, update the quantity
      const updateParams = {
        TableName: 'inventorySummary',
        Key: {
          SKU: { S: sku },
          tenentId: { S: tenentId }
        },
        UpdateExpression: 'SET quantity = quantity + :quantityChange, updatedAt = :updatedAt, lowStockThreshold = :lst, reorderAmount = :ra',
        ExpressionAttributeValues: {
          ':quantityChange': { N: quantity.toString() },
          ':updatedAt': { S: new Date().toISOString() },
          ':lst': { N: lowStockThreshold.toString() },
          ':ra': { N: reorderAmount.toString() },
        },
        ReturnValues: 'UPDATED_NEW'
      };
      await dynamoDB.updateItem(updateParams);
    } else {
      // If the item doesn't exist, invoke the inventorySummary-createItem Lambda function
      const lambdaParams = {
        FunctionName: 'inventorySummary-createItem',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          body: JSON.stringify({ 
            SKU: sku, 
            tenentId: tenentId, 
            quantity, 
            description, 
            lowStockThreshold, 
            reorderAmount,
            upc,
            category
          })
        })
      };
      await lambda.invoke(lambdaParams);
    }

    // Query the suppliers table to get the supplierID
    const supplierQueryParams = {
      TableName: 'suppliers',
      IndexName: 'company_name-index',
      KeyConditionExpression: 'company_name = :companyName',
      ExpressionAttributeValues: {
        ':companyName': { S: supplier }
      }
    };
    const supplierQueryResult = await dynamoDB.query(supplierQueryParams);
    
    if (supplierQueryResult.Items.length === 0) {
      throw new Error(`Supplier ${supplier} not found in suppliers table`);
    }
    
    const supplierID = supplierQueryResult.Items[0].supplierID.S;
    
    const supplierItemID = `${supplierID}#${sku}`; // Generate the supplierItemID

    const supplierItemsQueryParams = {
      TableName: 'supplierItems',
      KeyConditionExpression: 'supplierID = :supplierId AND supplierItemID = :supplierItemId',
      ExpressionAttributeValues: {
        ':supplierId': { S: supplierID },
        ':supplierItemId': { S: supplierItemID }
      }
    };

    const existingSupplierItems = await dynamoDB.query(supplierItemsQueryParams);

    if (existingSupplierItems.Items.length === 0) {
      // If the item doesn't exist in supplierItems, invoke the supplierItems-createItem Lambda function
      const supplierItemsLambdaParams = {
        FunctionName: 'supplierItems-createItem',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
          body: JSON.stringify({ 
            supplierID,
            tenentId,
            SKU: sku
          })
        })
      };
      await lambda.invoke(supplierItemsLambdaParams);
    }

    // Original inventory-createItem logic
    const inventoryID = generateUUID();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    
    // Generate QR code
    const qrCodeData = {
      inventoryID: inventoryID,
      tenentId: tenentId
    };
    const qrCode = await generateQRCode(qrCodeData);
    
    const params = {
      TableName: 'inventory',
      Item: {
        inventoryID: { S: inventoryID },
        tenentId: { S: tenentId },
        upc: { S: upc },
        description: { S: description },
        category: { S: category },
        quantity: { N: quantity.toString() },
        SKU: { S: sku },
        supplier: { S: supplier },
        lowStockThreshold: { N: lowStockThreshold.toString() },
        reorderAmount: { N: reorderAmount.toString() },
        expirationDate: { S: expirationDate },
        qrCode: { S: qrCode },
        createdAt: { S: createdAt },
        updatedAt: { S: updatedAt },
        ...(leadTime && { leadTime: { N: leadTime.toString() } }),
        ...(deliveryCost && { deliveryCost: { N: deliveryCost.toString() } }),
        ...(unitCost && { unitCost: { N: unitCost.toString() } }),
        ...(dailyDemand && { dailyDemand: { N: dailyDemand.toString() } })
      },
    };
    await dynamoDB.putItem(params);
    
    // Create a notification for the new inventory item
    const notificationMessage = `New item added to inventory: ${description} (SKU: ${sku}, Quantity: ${quantity})`;
    await createNotification(tenentId, notificationMessage, 'NEW_INVENTORY_ITEM');    
    
    return {
      statusCode: 201,
      body: JSON.stringify({ inventoryID }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

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