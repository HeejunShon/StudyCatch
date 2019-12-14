var mysql = require('mysql'); //mysql 모듈 사용
var db = mysql.createConnection({
  host  : 'localhost',
  user  : 'root',
  password  : '111111',
  database  : 'studyexample'
});
db.connect(); // 연결~

module.exports = db;