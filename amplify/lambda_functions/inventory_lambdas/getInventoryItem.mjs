import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const { inventoryID, tenantId } = event;

  if (!inventoryID || !tenantId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing inventoryID or tenantId" }),
    };
  }

  const params = {
    TableName: "inventory",
    Key: {
      inventoryID: inventoryID,
      tenentId: tenantId,
    },
  };

  try {
    const { Item } = await docClient.send(new GetCommand(params));

    if (!Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(Item),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not retrieve item" }),
    };
  }
};