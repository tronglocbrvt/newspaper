const env = require('../env.js')
const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : env.DB_HOST,
      user : env.DB_USER,
      password : env.DB_PASSWORD,
      database : env.DB_NAME
    }
  });
  module.exports = knex;