import AWS from 'aws-sdk';
import { createAWSResErr } from '../util/createAWSResErr';
import middy from 'middy';
import { cors } from 'middy/middlewares';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAllReviews() {
  const params = {
    TableName: process.env.REVIEW_TABLE_NAME
  };

  try {
    const result = await dynamodb.scan(params).promise();
    const reviews = result.Items;
    return {
      statusCode: 200,
      body: JSON.stringify({ reviews })
    };
  } catch (e) {
    console.error(e);
    return createAWSResErr(404, e);
  }
}

export const handler = middy(getAllReviews).use(cors());
