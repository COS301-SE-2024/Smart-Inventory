import { DynamoDB } from '@aws-sdk/client-dynamodb';
const dynamoDB = new DynamoDB();

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
    const { tenentId, memberId, name, role, task, timeSpent, idleTime, details } = requestBody;

    if (!tenentId || !memberId || !name || !role || !task || timeSpent == undefined || idleTime == undefined || !details) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const activityID = generateUUID();
    const createdAt = new Date().toISOString();

    const params = {
      TableName: 'userActivity',
      Item: {
        activityID: { S: activityID },  // Partition key
        tenentId: { S: tenentId },      // Sort key
        memberId: { S: memberId },
        name: { S: name },
        role: { S: role },
        task: { S: task },
        timeSpent: { N: timeSpent.toString() },
        idleTime: { N: idleTime.toString() },
        details: { S: details},
        createdAt: { S: createdAt },
      },
    };

    await dynamoDB.putItem(params);

    return {
      statusCode: 201,
      body: JSON.stringify({ activityID, tenentId }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};