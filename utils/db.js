const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : 'LinhLocPhuc11122000@gmail.com',
      database : 'LLPWebDatabase',
      port: 3306
    },
    pool: { min: 0, max: 50 }
  });

  module.exports = knex;