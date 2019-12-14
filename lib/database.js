var mysql = require('mysql');

var db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'hollys',
    database:'studycatch',
    charset: 'utf8',
    multipleStatements: true
  });
  db.connect();

module.exports = db;

//// **** multipleStatements: true  **** mysql connection에 꼭 추가!
