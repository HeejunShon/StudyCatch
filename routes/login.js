var express = require('express');
var router = express.Router();

var fs = require('fs');
var ejs = require('ejs');
var flash = require('connect-flash');

var loginEjs = fs.readFileSync('lib/ejs/login.ejs', 'utf8');
var homeTemplateEjs = fs.readFileSync('lib/ejs/homeTemplate.ejs', 'utf8');

router.use(flash());
router.get('/error', function(req, res){

    var errmsg = "아이디와 비밀번호를 확인해주세요";

    req.flash('errorMessage', errmsg);
    res.redirect('/login');
  
});

router.get('/', function(req, res){

    var userName = " ";
  
    var home = ejs.render(homeTemplateEjs, {
        userName: userName,
        banner: ejs.render(loginEjs,{
            message: req.flash('errorMessage'),
        }),
        communitiesTile: ``
    });

    res.send(home);
});

module.exports = router;