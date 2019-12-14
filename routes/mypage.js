var express = require('express');
var router = express.Router();
var db = require('../lib/database.js');
var fs = require('fs');
var ejs = require('ejs');
var flash = require('connect-flash');
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

var mypageEjs = fs.readFileSync('lib/ejs/mypage.ejs', 'utf8');
var mypageModifyEjs = fs.readFileSync('lib/ejs/mypage_modify.ejs', 'utf8');
var homeTemplateEjs = fs.readFileSync('lib/ejs/homeTemplate.ejs', 'utf8');

router.get('/', function(req, res){

    var user = req.user;
    var userName = " ";

    if(user){
        userName = user.displayName;
    }
    else{
        res.redirect('/login');
    }

    db.query
    (`select communityName from communities where masterId = ?`, 
    [user.id],
    function(err, result){
        if(err){
            throw(err);
        }else{

            var home = ejs.render(homeTemplateEjs, {
                userName: userName,
                banner: ejs.render(mypageEjs,{
                    userId: user.username,
                    displayName: userName,
                    email: user.email,
                    approved: user.approved,
                    communities: result
                }),
                communitiesTile: ``
            });

            res.send(home);
        }
    })
    

});

router.use(flash());
router.get('/error', function(req, res){
  var err = "";
  var errmsg = "";
  if(req.query){
    
    err = req.query.errmsg;

    if(err === "emptyErr"){
      errmsg = "모든 정보를 입력해주세요";
    }
    else if(err === "pwdErr"){
      errmsg = "비밀번호 확인을 다시 해주세요";
    }

    req.flash('errorMessage', errmsg);
    res.redirect('/mypage/modify');
  }
});

router.get('/modify', function(req, res){
    var user = req.user;
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }
    else{//로그인X -> 로그인화면 리다이렉트
        res.redirect('/login');
    }
    /* ejs */

    var home = ejs.render(homeTemplateEjs, {
        userName: userName,
        banner: ejs.render(mypageModifyEjs,{
            message: req.flash('errorMessage'),
            userId: user.username,
            displayName: userName,
            email: user.email,
        }),
        communitiesTile: ``
    });

    res.send(home);
});



router.post('/modify_process', function (req, res) {

    var user = req.user;

    // 빈칸 체크
    if(
        !req.body.password ||
        !req.body.password_check ||
        !req.body.displayName 
        ){
        errormsg = "emptyErr";
        isError = true;
        res.redirect('/mypage/error?errmsg='+errormsg);
        return;
    }
    // 비밀번호 확인 오류
    if(req.body.password != req.body.password_check){
        errormsg = "pwdErr";
        isError = true;
        res.redirect('/mypage/error?errmsg='+errormsg);
        return;
    }

    //비밀번호 hash로 변환
    hasher({ password: req.body.password }, function (err, pass, salt, hash) {

        var _password = hash;
        var _displayName = req.body.displayName;
        var _salt = salt;

        var sql = 'UPDATE users SET password=?, displayName=?, salt=? where id=?';
        db.query(sql, [_password, _displayName, _salt, user.id], function (err, results) {
            if (err) {
                console.log(err);
                res.status(500);
            } else {
                req.login(user, function (err) {
                    req.session.save(function () {
                        res.redirect('/mypage');
                    });
                });
            }
        });
    });
}); 

module.exports = router;