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

  let user;

  try {
    const result = await dynamodb.query(params).promise();
    user = result.Items[0];
    
    if (!(await verifyPassword(password, user.password))) {
      createAWSResErr(401, 'Incorrect email or password');
    }
  } catch (e) {
    console.error(e);
    createAWSResErr(404, e)
  }

  return {
    statusCode: 201,
    body: JSON.stringify(user)
  };
}

async function verifyPassword (candidatePassword, userPassword) {
  return bcrypt.compareSync(candidatePassword, userPassword);
}

export const handler = middy(login)
  .use(cors());
