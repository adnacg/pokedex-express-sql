// const pg = require('pg');

// // Initialise postgres client
// const config = {
//   user: 'elvera',
//   host: '127.0.0.1',
//   database: 'pokemons',
//   port: 5432,
// };

// const pool = new pg.Pool(config);

// pool.on('error', function (err) {
//   console.log('idle client error', err.message, err.stack);
// });

// module.exports = pool;



const promise = require('bluebird');

// Initialisation Options
const options = {
    // override pg-promise's default promise library (ES6 promises) with bluebird's promiseLib property in the options object
    promiseLib: promise
}

const pgp = require('pg-promise')(options);
// Configuration
const connectionString = 'postgres://localhost:5432/pokemons';
const db = pgp(connectionString);

module.exports = db;