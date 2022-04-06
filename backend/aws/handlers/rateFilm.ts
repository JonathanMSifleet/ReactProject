import { createAWSResErr } from '../shared/functions/createAWSResErr';
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  UpdateItemCommandOutput
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import alterNumRatings from '../shared/functions/alterNumRatings';
import cors from '@middy/http-cors';
import createDynamoSearchQuery from '../shared/functions/queries/createDynamoSearchQuery';
import createDynamoUpdateQuery from '../shared/functions/queries/createDynamoUpdateQuery';
import getUserRatings from '../shared/functions/getUserRatings';
import IHTTP from '../shared/interfaces/IHTTP';
import IRating from '../../../shared/interfaces/IRating';
import middy from '@middy/core';
import percentRank from 'percentile-rank';
import updateUserRatingsTableRatings from '../shared/functions/updateUserRatingsTableRatings';
import validateAccessToken from '../shared/functions/validateAccessToken';

const dbClient = new DynamoDBClient({});

const rateFilm = async (event: {
  body: string;
  headers: { Authorization: string };
  pathParameters: { username: string };
}): Promise<IHTTP> => {
  const { imdbID, rating, review, reviewAlreadyExists } = JSON.parse(event.body);
  const { username } = event.pathParameters;

  const accessToken = event.headers.Authorization.split(' ')[1];

  const validToken = await validateAccessToken(dbClient, username, accessToken);
  if (validToken !== true) return createAWSResErr(401, 'Access token invalid');

  const payload: IRating = {
    username,
    createdAt: Date.now(),
    imdbID,
    rating
  };

  if (review) payload.review = review;

  try {
    const percentile = await getFilmWithSameRating(username, payload.rating);
    payload.ratingPercentile = (
      percentile instanceof Error ? await getPercentile(payload.rating, username) : percentile
    ) as number;

    const result = await insertRatingToDB(payload);
    if (result instanceof Error) return createAWSResErr(520, result.message);

    await updateUserRatingsTableRatings(dbClient, username, payload);

    if (!reviewAlreadyExists) {
      const numRatings = (await alterNumRatings(dbClient, username, 1)) as number;

      if (numRatings % 25 === 0) await regeneratePercentiles(username);
    }

    return {
      statusCode: 201,
      body: JSON.stringify('Successfully inserted review')
    };
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(520, error.message);
  }

  return createAWSResErr(520, 'Unhandled Exception');
};

export const handler = middy(rateFilm).use(cors());

const getPercentile = async (rating: number, username: string): Promise<number> => {
  const results = (await getUserRatings(dbClient, username, 'rating')) as IRating[];
  const ratings = results.map((result) => result.rating);

  return Math.round(percentRank(ratings, rating) * 100);
};

const getFilmWithSameRating = async (username: string, rating: number): Promise<IHTTP | { [key: string]: number }> => {
  const query = createDynamoSearchQuery(
    process.env.RATINGS_TABLE_NAME!,
    'ratingPercentile',
    'username',
    username,
    'S',
    'usernameRating',
    'rating',
    rating.toString(),
    'N'
  );
  query.Limit = 1;
  query.ScanIndexForward = false;
  query.KeyConditionExpression = 'username = :username AND rating <= :rating';

  try {
    const result = await dbClient.send(new QueryCommand(query));
    return unmarshall(result.Items![0]).ratingPercentile;
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(520, error.message);
  }

  return createAWSResErr(500, 'Unhandled Exception');
};

const insertRatingToDB = async (payload: IRating): Promise<IHTTP | void> => {
  const params = {
    TableName: process.env.RATINGS_TABLE_NAME!,
    Item: marshall(payload),
    ReturnConsumedCapacity: 'TOTAL'
  };

  try {
    await dbClient.send(new PutItemCommand(params));
    console.log('Inserted rating successfully');
    return;
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(520, error.message);
  }

  return createAWSResErr(500, 'Unhandled Exception');
};

const regeneratePercentiles = async (username: string): Promise<IHTTP | void> => {
  const ratings = (await getUserRatings(dbClient, username, 'imdbID, rating')) as IRating[];
  const extractedRatings = ratings.map((rating) => rating.rating);

  const percentileRequests: Promise<UpdateItemCommandOutput>[] = [];
  ratings.forEach((rating) => {
    const percentile = Math.round(percentRank(extractedRatings, rating.rating) * 100);

    const params = createDynamoUpdateQuery(
      process.env.RATINGS_TABLE_NAME!,
      'imdbID',
      rating.imdbID.toString(),
      'N',
      'ratingPercentile',
      percentile.toString(),
      'N',
      'username',
      username,
      'S'
    );

    percentileRequests.push(dbClient.send(new UpdateItemCommand(params)));
  });

  try {
    await Promise.all(percentileRequests);
    console.log('Successfully regenerated percentiles');
    return;
  } catch (error) {
    if (error instanceof Error) return createAWSResErr(500, error.message);
  }

  return createAWSResErr(500, 'Unhandled Exception');
};
