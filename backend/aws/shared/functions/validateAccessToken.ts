import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';

import { unmarshall } from '@aws-sdk/util-dynamodb';
import createDynamoSearchQuery from './DynamoDB/createDynamoSearchQuery';
import IHTTP from '../interfaces/IHTTP';

const dbClient = new DynamoDBClient({});

const validateAccessToken = async (username: string, accessToken: string): Promise<IHTTP | boolean> => {
  const params = createDynamoSearchQuery(process.env.USER_TABLE_NAME!, 'accessToken', 'username', username, 'S');

  const result = await dbClient.send(new QueryCommand(params));
  const unmarshalledResult = unmarshall(result.Items![0]);

  const userAccessToken = JSON.parse(unmarshalledResult.accessToken).accessToken;

  return userAccessToken === accessToken
    ? true
    : {
        statusCode: 401,
        body: JSON.stringify('Invalid access token')
      };
};

export default validateAccessToken;
