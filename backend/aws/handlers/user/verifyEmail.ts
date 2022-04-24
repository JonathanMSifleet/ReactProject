import { createAWSResErr } from '../../shared/functions/createAWSResErr';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import cors from '@middy/http-cors';
import IHTTP from '../../shared/interfaces/IHTTP';
import middy from '@middy/core';

const dbClient = new DynamoDBClient({});

interface IToken {
  expires: number;
  token: string;
}

const verifyEmail = async (event: {
  body: string;
  pathParameters: { username: string; token: string };
}): Promise<IHTTP> => {
  const { username, token } = event.pathParameters;

  const dbToken = (await validateToken(username)) as IToken;
  if (dbToken instanceof Error) return createAWSResErr(500, 'Error getting existing token');
  if (dbToken.expires < Date.now()) return createAWSResErr(400, 'Token has expired');
  if (dbToken.token !== token) return createAWSResErr(400, 'Invalid token');

  try {
    await updateVerificationStatus(username);
    return { statusCode: 204 };
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(500, error.message);
  }

  return createAWSResErr(500, 'Unhandled Exception');
};

export const handler = middy(verifyEmail).use(cors());

const updateVerificationStatus = async (username: string): Promise<void | Error> => {
  const query = {
    TableName: process.env.USER_TABLE_NAME!,
    Key: {
      username: { S: username }
    },
    UpdateExpression: 'set isVerified = true',
    ReturnValues: 'UPDATED_NEW'
  };

  try {
    await dbClient.send(new UpdateItemCommand(query));

    console.log('Password updated successfully');
    return;
  } catch (error) {
    return new Error();
  }
};

const validateToken = async (username: string): Promise<IToken | Error> => {
  const query = {
    TableName: process.env.USER_TABLE_NAME!,
    Key: {
      username: { S: username }
    },
    ProjectionExpression: 'verificationToken'
  };

  try {
    const results = await dbClient.send(new GetItemCommand(query));
    return unmarshall(results.Item!) as IToken;
  } catch (error) {
    return new Error();
  }
};
