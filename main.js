const express = require('express')
const app = express()
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var hasher = bkfd2Password();

var indexRouter = require('./routes/index');
var pageRouter = require('./routes/page');
var qnaRouter = require('./routes/QnA.js');
var freeRouter = require('./routes/free.js');
var studyRouter = require('./routes/Study.js');
var authRouter = require('./routes/auth.js');
var joinRouter = require('./routes/join.js');
var homeRouter = require('./routes/home.js');
var loginRouter = require('./routes/login.js');
var mypageRouter = require('./routes/mypage.js');
var communityRouter = require('./routes/community.js');

var myRouter = require('./routes/my.js'); /* 추가 된 부분_191113 */


var db = require('./lib/database.js');

/* 미들웨어 */

//정적파일삽입 허용(public 폴더)
app.use(express.static('public'));
//바디파서
app.use(bodyParser.urlencoded({ extended: false }));
//본문압축
app.use(compression());
//파일리스트 전달
app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});
//서브파일리스트 전달
app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

app.use(session({
  secret: '1234DSFs@adf1234!@#$asd',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: 'hollys',
      database: 'studycatch',
  })
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  //console.log('serializeUser', user);
  done(null, user.authId);
});
passport.deserializeUser(function (id, done) {
  //console.log('deserializeUser', id);
  var sql = 'SELECT * FROM users WHERE authId=?';
  db.query(sql, [id], function (err, results) {
      if (err) {
          console.log(err);
          done('There is no user.');
      } else {
          done(null, results[0]);
      }
  });
});

passport.use(new LocalStrategy(
  function (username, password, done) {
      var uname = username;
      var pwd = password;
      var sql = 'SELECT * FROM users WHERE authId=?';
      db.query(sql, ['local:' + uname], function (err, results) {
          if (err) {
              return done('There is no user.');
          }
          var user = results[0];
          return hasher({ password: pwd, salt: user.salt }, function (err, pass, salt, hash) {
              if (hash === user.password) {
                  console.log('LocalStrategy', user);
                  done(null, user);
              } else {
                  done(null, false);
              }
          });
      });
  }
));

//페이지 라우터
app.use('/', indexRouter);
app.use('/page', pageRouter);
app.use('/QnA', qnaRouter);
app.use('/free', freeRouter);
app.use('/Study', studyRouter);
app.use('/auth', authRouter);
app.use('/join', joinRouter);
app.use('/login', loginRouter);
app.use('/home', homeRouter);
app.use('/mypage', mypageRouter);
app.use('/community', communityRouter);

app.use('/my', myRouter); // 추가 된 부분_191113


//페이지 에러처리
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});



app.listen(3000, () => console.log('Example app listening on port 3000!'))
