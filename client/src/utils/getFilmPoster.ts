import ShrugSVG from '../assets/svg/Shrug.svg';
import convertIDToIMDbFormat from './convertIDToIMDbFormat';
import httpRequest from './httpRequest';

const getFilmPoster = async (imdbID: number): Promise<string> => {
  const formattedID = convertIDToIMDbFormat('film', imdbID);

  // eslint-disable-next-line
  const url =
    `https://api.themoviedb.org/3/find/${formattedID}?api_key=${process.env.TMDB_KEY}&external_source=imdb_id`;

  const response = await httpRequest(url, 'GET', false);

  try {
    const poster = response.movie_results[0].poster_path;
    return `http://image.tmdb.org/t/p/original${poster}`;
  } catch (error) {
    return ShrugSVG;
  }
};

export default getFilmPoster;
