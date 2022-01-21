import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import middy from '@middy/core';
import cors from '@middy/http-cors';
import { createAWSResErr } from '../shared/functions/createAWSResErr';
import IHTTP from '../shared/interfaces/IHTTP';
import IHTTPErr from '../shared/interfaces/IHTTPErr';

export const uploadUserAvatar = async (event: {
  pathParameters: { UID: string };
  body: Buffer;
}): Promise<IHTTPErr | IHTTP> => {
  const image = event.body.slice(1, -1);
  const filename = `${event.pathParameters.UID}.jpg`;

  try {
    await uploadPicture(filename, image);

    return {
      statusCode: 200,
      body: JSON.stringify('Successfully uploaded image')
    };
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(500, error.message);
  }

  return createAWSResErr(500, 'Internal Server Error');
};

const uploadPicture = async (filename: string, body: Buffer): Promise<void | IHTTPErr> => {
  const params = {
    Bucket: process.env.USER_AVATAR_BUCKET_NAME!,
    Key: filename,
    Body: body,
    ContentEncoding: 'base64',
    ContentType: 'image/jpg'
  };

  try {
    await new S3Client({}).send(new PutObjectCommand(params));
    console.log('Successfully uploaded image');
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(520, error.message);
  }
};

export const handler = middy(uploadUserAvatar).use(cors());
