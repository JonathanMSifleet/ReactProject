const ROOT = 'https://fl6lwlunp9.execute-api.eu-west-2.amazonaws.com/dev';

export const ADD_PEOPLE = `${ROOT}/migration/addPeople`;
export const DELETE_ACCOUNT = `${ROOT}/user/deleteAccount`;
export const DELETE_RATING = `${ROOT}/rating/deleteRating`;
export const GENERATE_TCI = `${ROOT}/user/generateTCI`;
export const GET_ALL_RATINGS = `${ROOT}/rating/getAllRatings`;
export const GET_FILMS = `${ROOT}/film/getFilms`;
export const GET_FILM_DETAILS = `${ROOT}/film/getFilmDetails`;
export const GET_FILM_RATINGS = `${ROOT}/film/getFilmRatings`;
export const GET_NUM_RATINGS = `${ROOT}/user/getNumRatings`;
export const GET_PROFILE_BY_USERNAME = `${ROOT}/user/profile`;
export const GET_RECENT_RATINGS = `${ROOT}/user/getRecentRatings`;
export const GET_USER_AVATAR = `${ROOT}/user/avatar`;
export const GET_USER_RATING = `${ROOT}/rating/getUserRating`;
export const IMPORT_FILM_BATCH = `${ROOT}/migration/importFilmBatch`;
export const IMPORT_RATINGS = `${ROOT}/rating/importRatings`;
export const LOGIN = `${ROOT}/user/login`;
export const RATE_FILM = `${ROOT}/rating/rateFilm`;
export const SEARCH_FOR_FILM = `${ROOT}/film/searchForFilm`;
export const SIGNUP = `${ROOT}/user/signup`;
export const UPDATE_USER_PROFILE = `${ROOT}/user/profile`;
export const UPLOAD_USER_AVATAR = `${ROOT}/user/avatar`;

// mock data endpoints:
export const ADD_ACCOUNTS = `${ROOT}/mockData/addAccounts`;
export const AGGREGATE_PERCENTILES = `${ROOT}/mockData/aggregateUserPercentiles`;
export const IMPORT_AVATARS = `${ROOT}/mockData/importAvatars`;
export const IMPORT_GENERATED_RATINGS = `${ROOT}/mockData/importGeneratedRatings`;
export const UPDATE_NUM_RATINGS = `${ROOT}/mockData/importGeneratedRatings`;
export const UPDATE_PERCENTILES = `${ROOT}/mockData/updatePercentiles`;
