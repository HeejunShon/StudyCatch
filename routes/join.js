var express = require('express');
var router = express.Router();
var flash = require('connect-flash');
var fs = require('fs');
var ejs = require('ejs');

var joinEjs = fs.readFileSync('lib/ejs/join.ejs', 'utf8');
var joinSuccess = fs.readFileSync('lib/ejs/joinSuccess.ejs', 'utf8');
var homeTemplateEjs = fs.readFileSync('lib/ejs/homeTemplate.ejs', 'utf8');
 
router.use(flash());
router.get('/error', function(req, res){
  var err = "";
  var errmsg = "";
  if(req.query){
    
    err = req.query.errmsg;

    if(err === "emptyErr"){
      errmsg = "모든 정보를 입력해주세요";
    }
    else if(err === "OverlapErr"){
      errmsg = "이미 사용 중인 아이디/이메일 입니다.";
    }
    else if(err === "pwdErr"){
      errmsg = "비밀번호 확인을 다시 해주세요";
    }

    req.flash('errorMessage', errmsg);
    res.redirect('/join/');
  }
});

router.get('/', function(req, res) { 

    var userName = " ";
    
    var home = ejs.render(homeTemplateEjs, {
        userName: userName,
        banner: ejs.render(joinEjs,{
            message: req.flash('errorMessage'),
        }),
        communitiesTile: ``
    });

    res.send(home);
});
   
router.get('/success', function(req, res){

    var userName = " ";
      
    var home = ejs.render(homeTemplateEjs, {
        userName: userName,
        banner: ejs.render(joinSuccess),
        communitiesTile: ``
    });

    res.send(home);

});

module.exports = router;