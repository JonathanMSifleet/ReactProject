import * as endpoints from '../../constants/endpoints';

import chunk from 'chunk';
import httpRequest from '../httpRequest';

interface ISQLFilm {
  company: string;
  countries: string;
  description: string;
  filmDuration: number;
  genres: string;
  imdbID: number;
  languages: string;
  releaseYear: number;
  title: string;
}

type TBatch = {
  PutRequest: {
    Item: ISQLFilm;
  };
}[];

const migrateFilms = async (films: ISQLFilm[]): Promise<void> => {
  const marshalledFilms = films.map((film) => {
    // remove null attributes from film object
    Object.keys(film).forEach((key: string) => {
      // @ts-expect-error key can be used as index
      if (film[key] === null) delete film[key];
    });

    Object.keys(film).forEach((key: string) => {
      switch (true) {
        case key === 'filmDuration' || key === 'releaseYear' || key === 'imdbID':
          // @ts-expect-error key can be used as index
          film[key] = { N: film[key] };
          break;
        default:
          // @ts-expect-error key can be used as index
          film[key] = { S: film[key] };
          break;
      }
    });

    return { PutRequest: { Item: film } };
  });

  const filmBatches = chunk(marshalledFilms, 25);
  // max chrome concurrent connections = 6, use 4 to be safe
  const largeFilmBatches = chunk(filmBatches, 4);

  console.log('Starting import');

  let i = 1;
  for await (const largeBatch of largeFilmBatches) {
    const importRequests: Promise<any>[] = [];
    largeBatch.forEach((batch: TBatch) => {
      console.log(`Importing batch ${i} out of ${filmBatches.length}`);
      i++;
      importRequests.push(httpRequest(endpoints.IMPORT_FILM_BATCH, 'POST', undefined, batch));
    });

    try {
      await Promise.all(importRequests);
    } catch (error) {
      console.error(error);
    }
  }

  console.log('Import completed');
};

export default migrateFilms;