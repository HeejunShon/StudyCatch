
var express = require('express');
var bodyParser = require('body-parser');
var bkfd2Password = require("pbkdf2-password");
var passport = require('passport');
var hasher = bkfd2Password();
var router = express.Router();

var db = require('../lib/database.js');

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/logout', function (req, res) {
    req.logout();
    req.session.save(function () {
        res.redirect('/');
    });
});

router.post(
    '/login',
    passport.authenticate(
        'local',
        {
            successRedirect: '/home/',
            failureRedirect: '/login/error',
            failureFlash: false
        }
    )
);

router.post('/register', function (req, res) {

    var errormsg="before";
    var fullEmail = req.body.email_id+'@'+req.body.email_site;
 
    // 만들다가 뒤질 뻔한 오류 체크

    // 빈칸 체크
    if(!req.body.username || 
        !req.body.password ||
        !req.body.password_check ||
        !req.body.displayName ||
        !req.body.email_id ||
        !req.body.email_site
        ){
        errormsg = "emptyErr";
        isError = true;
        res.redirect('/join/error?errmsg='+errormsg);
        return;
    }

    // 아이디/이메일 중복 체크
    db.query(
    `SELECT username FROM users WHERE username=? or email=?`, 
    [req.body.username, fullEmail], function (err, results) {
        if (err) {
            console.log(err);
        }
        if(results.length != 0){
            errormsg = "OverlapErr";
            res.redirect('/join/error?errmsg='+errormsg);
            return;
        }

        // 비밀번호 확인 오류
        if(req.body.password != req.body.password_check){
            errormsg = "pwdErr";
            isError = true;
            res.redirect('/join/error?errmsg='+errormsg);
            return;
        }

        //비밀번호 hash로 변환
        hasher({ password: req.body.password }, function (err, pass, salt, hash) {
            var user = {
                authID: 'local:'+req.body.username,
                username: req.body.username,
                password: hash,
                salt: salt,
                displayName: req.body.displayName,
                email: fullEmail,
                approved: req.body.approved
            };
            var sql = 'INSERT INTO users SET ?';
            db.query(sql, user, function (err, results) {
                if (err) {
                    console.log(err);
                    res.status(500);
                } else {
                    req.login(user, function (err) {
                        req.session.save(function () {
                            res.redirect('/join/success');
                        });
                    });
                }
            });
        });
    }); 
});

router.get('/login', function (req, res) {
    var output = `
  <h1>Login</h1>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
    res.send(output);
});

module.exports = router;