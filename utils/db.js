const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : 'LinhLocPhuc11122000@gmail.com',
      database : 'LLP_NEWSPAPER',
      port: 3306
    }
  });
  module.exports = knex;