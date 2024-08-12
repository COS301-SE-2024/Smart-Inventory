import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    try {
        const { tenentId, quoteId } = event.pathParameters;
        const updatedQuote = JSON.parse(event.body);

        console.log('Parsed updatedQuote:', JSON.stringify(updatedQuote, null, 2));

        if (!tenentId || !quoteId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required path parameters" }),
            };
        }

        // Update quote items
        console.log('Deleting existing items for QuoteID:', quoteId);
        
        // First, query for existing items
        const queryItemsParams = {
            TableName: 'generatedQuoteItems',
            KeyConditionExpression: 'QuoteID = :quoteId',
            ExpressionAttributeValues: {
                ':quoteId': quoteId
            }
        };
        
        const existingItems = await ddbDocClient.send(new QueryCommand(queryItemsParams));
        
        // Delete each existing item
        for (const item of existingItems.Items || []) {
            const deleteItemParams = {
                TableName: 'generatedQuoteItems',
                Key: {
                    QuoteID: quoteId,
                    ItemSKU: item.ItemSKU
                }
            };
            await ddbDocClient.send(new DeleteCommand(deleteItemParams));
        }

        console.log('Adding new items');
        for (const item of updatedQuote.items) {
            const putItemParams = {
                TableName: 'generatedQuoteItems',
                Item: {
                    QuoteID: quoteId,
                    ItemSKU: item.ItemSKU,
                    Quantity: item.Quantity,
                    tenentId: tenentId
                }
            };
            await ddbDocClient.send(new PutCommand(putItemParams));
        }

        // Update quote suppliers
        console.log('Deleting existing suppliers for QuoteID:', quoteId);
        
        // First, query for existing suppliers
        const querySuppliersParams = {
            TableName: 'generatedQuoteSuppliers',
            KeyConditionExpression: 'QuoteID = :quoteId',
            ExpressionAttributeValues: {
                ':quoteId': quoteId
            }
        };
        
        const existingSuppliers = await ddbDocClient.send(new QueryCommand(querySuppliersParams));
        
        // Delete each existing supplier
        for (const supplier of existingSuppliers.Items || []) {
            const deleteSupplierParams = {
                TableName: 'generatedQuoteSuppliers',
                Key: {
                    QuoteID: quoteId,
                    Supplier: supplier.Supplier
                }
            };
            await ddbDocClient.send(new DeleteCommand(deleteSupplierParams));
        }

        console.log('Adding new suppliers');
        for (const supplier of updatedQuote.suppliers) {
            const putSupplierParams = {
                TableName: 'generatedQuoteSuppliers',
                Item: {
                    QuoteID: quoteId,
                    Supplier: supplier,
                    tenentId: tenentId,
                    Active: true // Assuming you want to set this to true for new entries
                }
            };
            await ddbDocClient.send(new PutCommand(putSupplierParams));
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Quote updated successfully' }),
        };
    } catch (error) {
        console.error('Error updating quote details:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};