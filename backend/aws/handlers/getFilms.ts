import middy from '@middy/core';
import cors from '@middy/http-cors';
import serverlessMysql from 'serverless-mysql';
import { createAWSResErr } from '../shared/functions/createAWSResErr';
import IHTTP from '../shared/interfaces/IHTTP';
import IHTTPErr from '../shared/interfaces/IHTTPErr';
import { connectionDetails } from '../shared/MySQL/ConnectionDetails';
const mysql = serverlessMysql({ config: connectionDetails });

const getFilms = async (event: {
  pathParameters: { page: string };
}): Promise<IHTTP | IHTTPErr> => {
  const { page } = event.pathParameters;

  const numResults = resultsToReturn(page);

  try {
    const result = await mysql.query(
      `SELECT * FROM films ORDER BY imdb_title_id DESC LIMIT ${numResults}`,
      null
    );
    mysql.quit();

    console.log('Sucessfully fetched results');
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (e: any) {
    return createAWSResErr(500, e);
  }
};

const resultsToReturn = (page: string) => {
  switch (page) {
    case 'home':
      return 10;
  }
};

export const handler = middy(getFilms).use(cors());
