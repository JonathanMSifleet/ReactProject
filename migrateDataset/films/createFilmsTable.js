// based on:
// https://www.geeksforgeeks.org/how-to-import-data-from-csv-file-into-mysql-table-using-node-js/

const mysql = require('mysql2');
const csvtojson = require('csvtojson');

const connectionDetails = {
  host: 'localhost',
  user: 'JonathanS',
  password: 'DatasetMigration',
  database: 'critickeroverhaul'
};

const connection = mysql.createConnection(connectionDetails);

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');

  let sql;

  sql = 'DROP TABLE IF EXISTS films';
  executeSQL(sql, 'Table dropped if exists');

  sql =
    'CREATE TABLE films (imdb_title_id MEDIUMINT UNSIGNED, title VARCHAR(224), ' +
    'year SMALLINT, duration SMALLINT, description VARCHAR(512), ' +
    'PRIMARY KEY (imdb_title_id))';
  executeSQL(sql, 'Table created');

  populateTable();
});

const executeSQL = (sql, message) => {
  connection.query(sql, function (err, result) {
    if (err) throw err;
    console.log(message);
  });
};

const populateTable = () => {
  csvtojson()
    .fromFile('./datasets/IMDb_movies_usable_no_inline_commas.csv')
    .then((source) => {
      // Fetching the data from each row
      // and inserting to the table "sample"

      const numRows = source.length;
      const insertStatement = `INSERT INTO films VALUES (?, ?, ?, ?, ?)`;

      for (let i = 0; i < numRows; i++) {
        let imdb_title_id = source[i]['imdb_title_id'],
          title = source[i]['title'],
          year = source[i]['year'],
          duration = source[i]['duration'],
          description = source[i]['description'];

        // remove unnecessary id prefix:
        imdb_title_id = imdb_title_id.substring(2);

        const items = [imdb_title_id, title, year, duration, description];

        // Inserting data of current row into database
        insertRow(i, numRows, insertStatement, items);
      }
    });
};

const insertRow = (i, numRows, insertStatement, items) => {
  connection.query(insertStatement, items, (err, results, fields) => {
    if (err) {
      console.log('Unable to insert item at row ', i++);
      return console.log(err);
    }
    console.log(`Row ${i} of ${numRows}`);
  });
};
