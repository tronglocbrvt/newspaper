const knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'root',
      password : '',
      database : 'llpwebdatabase',
      port: 3306
    }
  });
  module.exports = knex;