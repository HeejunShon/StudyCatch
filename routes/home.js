var express = require('express');
var router = express.Router();
var homeTemplate = require('../lib/homeTemplate.js');
var db = require('../lib/database.js');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path'); //************** path 추가

var homeTemplateEjs = fs.readFileSync('lib/ejs/homeTemplate.ejs', 'utf8');
var communitiesTileEjs = fs.readFileSync('lib/ejs/communitiesTile.ejs', 'utf8');

//홈
router.get('/', function(request, response) { 

    var user = request.user;
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    var banner = `
        <script>
            function changeSelect(category){
                console.log(category.value);
                type = category.value;
                location.href = "/home/type/" + type;
            }
        </script>
        <section id="banner" class="major">
            <div class="inner">
                <header class="major">
                    <h1>Hello, StudyCatch</h1>
                </header>
                <div class="content">
                    <p>세상의 모든 스터디 그룹을 위한 온라인 커뮤니티와 클래스<br />
                    STUDY CATCH에 오신 것을 환영합니다.</p>
                    <ul class="actions">
                        <li><a href="#one" class="button next scrolly">둘러 보기</a></li>
                    </ul>
                </div>
                <div class="selector" style="position: absolute; text-align: center; bottom: 2em; right: 1em; width: 5em;">
                    <select id="category" onchange="javascript:changeSelect(this)">
                        <option value="all">All</option>
                        <option value="it">IT</option>
                        <option value="language">외국어</option>
                        <option value="music">음악</option>
                        <option value="art">예술</option>
                        <option value="cooking">요리</option>
                        <option value="society">사회</option>
                        <option value="etc">기타</option>
                    </select>
                </div>
            </div>
        </section>
    `;

    /* ejs 변환 (lib/ejs) */

    db.query(`select * from communities`, function(err, result){
        if(err){
            throw(err);
        }else{
            var home = ejs.render(homeTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: ejs.render(communitiesTileEjs,{
                    communities: result
                })
            });
            response.send(home);
        }
    })
});


//카테고리 별 홈
router.get('/type/:category/', function(request, response) { 
    var category = path.parse(request.params.category).base;
    console.log('카테고리 : '+ category);

    if(category=='all'){
        response.redirect('/home');
    }

    var user = request.user;
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }


    var banner = `
        <script>
            window.onload = function(){
                var sel = document.getElementById("category");

                for(var i = 0; i < sel.length; i++){
                    console.log('처리');
                    if(sel.options[i].value == "${category}"){
                        sel.options[i].selected = true;
                        break;
                    }
                }
            }

            function changeSelect(category){
                console.log(category.value);
                type = category.value;
                location.href = "/home/type/" + type;
            }
        </script>
        <section id="banner" class="major">
            <div class="inner">
                <header class="major">
                    <h1>Hello, StudyCatch</h1>
                </header>
                <div class="content">
                    <p>세상의 모든 스터디 그룹을 위한 온라인 커뮤니티와 클래스<br />
                    STUDY CATCH에 오신 것을 환영합니다.</p>
                    <ul class="actions">
                        <li><a href="#one" class="button next scrolly">둘러 보기</a></li>
                    </ul>
                </div>
                <div class="selector" style="position: absolute; text-align: center; bottom: 2em; right: 1em; width: 5em;">
                    <select id="category"  onchange="javascript:changeSelect(this)">
                        <option value="all">All</option>
                        <option value="it">IT</option>
                        <option value="language">외국어</option>
                        <option value="music">음악</option>
                        <option value="art">예술</option>
                        <option value="cooking">요리</option>
                        <option value="society">사회</option>
                        <option value="etc">기타</option>
                </select>
                </div>
            </div>
        </section>
    `;

    /* ejs 변환 (lib/ejs) */

    db.query(`select * from communities where category = ?`, [category], function(err, result){
        if(err){
            throw(err);
        }else{
            var home = ejs.render(homeTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: ejs.render(communitiesTileEjs,{
                    communities: result
                })
            });
            response.send(home);
        }
    })
});


//커뮤니티 생성
router.get('/create_group', function(request, response){
    var user = request.user;
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }
    else{//로그인X -> 로그인화면 리다이렉트
        response.redirect('/login');
        return;
    }

    var banner = `
        <section id="banner" class="major" style="align-items: center; justify-content: center; padding: 10% 30%">
            <div class="inner">
                <h3 style="margin: 0 0 0.6em 0;"> 커뮤니티 생성 </h3>
                <form action="/home/create_group_process" method="post">
                    <p>
                        <input type="text" name="communityName" placeholder="Community name">
                    </p>
                    <p>
                        <textarea name="introduction" placeholder="Introduction"></textarea>
                    </p>
                    <p>
                        <select name="category">
                            <option value="it">IT</option>
                            <option value="language">외국어</option>
                            <option value="music">음악</option>
                            <option value="art">예술</option>
                            <option value="cooking">요리</option>
                            <option value="society">사회</option>
                            <option value="etc">기타</option>
                        </select>
                    </p>
                    <p>
                        <input type="submit">
                    </p>
                </form>
            </div>
        </section>
    `;

    /* ejs */

    db.query(`select * from communities`, function(err, result){
        if(err){
            throw(err);
        }else{
            console.log('커뮤 : ' + result);
            var home = ejs.render(homeTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: ejs.render(communitiesTileEjs,{
                    communities: result
                })
            });

            response.send(home);
        }
    })
});

//커뮤니티 생성 처리
router.post('/create_group_process/', function(request, response){
    var post = request.body;
    var communityName = post.communityName;
    var introduction = post.introduction;
    var category = post.category;
    var masterId = request.user.id;
    var masterEmail = request.user.email;

    db.query(`insert into communities(communityName, introduction, category, masterId ,masterEmail)
        values(?, ?, ?, ?, ?)`,
        [communityName, introduction, category, masterId, masterEmail],
        function(error, result){
            if(error){
                console.log(error);
            }else{
                console.log('New Community has created : ' + communityName);
            }
        }
    );

    response.redirect('/home');
});

module.exports = router;