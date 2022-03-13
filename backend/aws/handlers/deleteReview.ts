import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import { createAWSResErr } from '../shared/functions/createAWSResErr';
import IHTTP from '../shared/interfaces/IHTTP';
const dbClient = new DynamoDBClient({});

const deleteReview = async (event: { pathParameters: {imdb_title_id: number, UID: string}}): Promise<IHTTP> => {
  const { imdb_title_id, UID} = event.pathParameters;

  try {
    const result = await dbClient.send(
      new DeleteItemCommand({
        TableName: process.env.RATINGS_TABLE_NAME,
        Key: {
          'imdb_title_id': { N: imdb_title_id.toString() },
          'UID': { S: UID }
        }
      })
    );

    console.log('Review deleted successfully');
    return {
      body: JSON.stringify(result),
      statusCode: 204
    };
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(403, error.message);
  }

  return createAWSResErr(500, 'Internal Server Error');
};

export const handler = middy(deleteReview).use(cors());
