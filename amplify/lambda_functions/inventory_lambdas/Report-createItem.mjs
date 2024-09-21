import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamoDB = new DynamoDB();
const docClient = DynamoDBDocument.from(dynamoDB);

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
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
    const { tenentId, sku, category, supplier, quantityRequested } = requestBody;
    if (!tenentId || !sku || !supplier || !quantityRequested || !category) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }
    const stockRequestId = generateUUID();
    const createdAt = new Date().toISOString();
    const params = {
      TableName: 'StockRequests',
      Item: {
        stockRequestId: { S: stockRequestId },
        tenentId: { S: tenentId },
        sku: { S: sku },
        category: { S: category },
        supplier: { S: supplier },
        quantityRequested: { N: quantityRequested.toString() },
        createdAt: { S: createdAt },
        type: { S: 'STOCK_REQUEST' }
      },
    };
    await dynamoDB.putItem(params);

    // Update aggregates
    await updateAggregates(tenentId, sku, category, parseInt(quantityRequested), createdAt);

    return {
      statusCode: 201,
      body: JSON.stringify({ 
        message: 'Stock request report created successfully',
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

async function updateAggregates(tenentId, sku, category, quantity, createdAt) {
  const date = new Date(createdAt);
  const dailyKey = `DAILY#${date.toISOString().split('T')[0]}#${sku}`;
  const weekNumber = getWeekNumber(date);
  const weeklyKey = `WEEKLY#${date.getFullYear()}-W${weekNumber}#${sku}`;

  await updateAggregate(tenentId, dailyKey, category, quantity);
  await updateAggregate(tenentId, weeklyKey, category, quantity);
}

async function updateAggregate(tenentId, aggregateKey, category, quantity) {
  const params = {
    TableName: 'StockRequestAggregates',
    Key: {
      tenentId: tenentId,
      aggregateKey: aggregateKey
    },
    UpdateExpression: 'ADD quantity :q SET category = :c, lastUpdated = :u',
    ExpressionAttributeValues: {
      ':q': quantity,
      ':c': category,
      ':u': new Date().toISOString()
    },
    ReturnValues: 'UPDATED_NEW'
  };

  await docClient.update(params);
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo.toString().padStart(2, '0');
}