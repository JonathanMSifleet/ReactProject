// import { catchAsyncErrors } from '../../utils/catchAsyncErrors';
// import { createAWSResErr } from '../../utils/createAWSResErr';
const middy = require('middy');
const { cors } = require('middy/middlewares');
import AWS from 'aws-sdk';
const dynamodb = new AWS.DynamoDB.DocumentClient();

// const User = require('../../models/userModel');

async function deleteAccount(event, context) {

  const { email } = event.requestContext.authorizer;

  console.log('user email', email);

  var params = {
    TableName: process.env.USER_TABLE_NAME,
    Key:{
        "email": email,
    },
    ConditionExpression:"email = :email",
    ExpressionAttributeValues: {
        ":email": email
    }
  };

  const result = await dynamodb.delete(params).promise();

  return {
    statusCode: 204,
    body: JSON.stringify(result)
  };
}

export const handler = middy(deleteAccount)
  .use(cors());