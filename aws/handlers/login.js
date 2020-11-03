const middy = require('middy');
const { cors } = require('middy/middlewares');
import { createAWSResErr } from '../../utils/createAWSResErr';
import AWS from 'aws-sdk';
import bcrypt from 'bcryptjs';

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function login(event, context) {

  const { email, password } = JSON.parse(event.body);

  if (!email || !password) {
    createAWSResErr(400, 'Please provide email and password!');
  }

  const params = {
    TableName: process.env.USER_TABLE_NAME,
    KeyConditionExpression: '#email = :email',
    ExpressionAttributeNames: {
      "#email": "email"
    },
    ExpressionAttributeValues: {
      ':email': email
    }
  };

  const result = await dynamodb.query(params).promise();
  const user = result.Items[0];

  if (!(await verifyPassword(password, user.password))) {
    createAWSResErr(401, 'Incorrect email or password');
  }

  console.log('User found, and password authenticated');

  return {
    statusCode: 201,
    body: user
  };
}

async function verifyPassword (candidatePassword, userPassword) {

  const correctPassword = await bcrypt.compareSync(candidatePassword, userPassword);
  return correctPassword;
}

export const handler = middy(login)
  .use(cors());
