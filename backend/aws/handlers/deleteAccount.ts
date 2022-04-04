import { DeleteItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';

import { createAWSResErr } from '../shared/functions/createAWSResErr';
import cors from '@middy/http-cors';
import IHTTP from '../shared/interfaces/IHTTP';
import middy from '@middy/core';

const dbClient = new DynamoDBClient({});

const deleteAccount = async (event: { requestContext: { authorizer: { email: string } } }): Promise<IHTTP> => {
  const { email } = event.requestContext.authorizer;

  try {
    const result = await dbClient.send(
      new DeleteItemCommand({
        TableName: process.env.USER_TABLE_NAME!,
        Key: {
          email: { S: email }
        }
      })
    );

    return {
      body: JSON.stringify(result),
      statusCode: 204
    };
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(403, error.message);
  }

  return createAWSResErr(500, 'Unhandled Exception');
};

export const handler = middy(deleteAccount).use(cors());
