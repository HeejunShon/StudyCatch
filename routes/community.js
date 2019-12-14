var express = require('express');
var app = express();

var router = express.Router();
var db = require('../lib/database.js');
var fs = require('fs');
var ejs = require('ejs');
var path = require('path');

var bodyParser = require('body-parser'); 
var mysql = require('mysql');

var communityTemplateEjs = fs.readFileSync('lib/ejs/communityTemplate.ejs', 'utf8');
var lecturesViewEjs = fs.readFileSync('lib/ejs/lecturesView.ejs', 'utf8');
var lectureEjs = fs.readFileSync('lib/ejs/lecture.ejs', 'utf8');
var classEjs = fs.readFileSync('lib/ejs/class.ejs', 'utf-8');
var bannerEjs = fs.readFileSync('lib/ejs/banner.ejs', 'utf-8');

var CreateTemplateEjs = fs.readFileSync('lib/ejs/CreateTemplate.ejs', 'utf-8');
var classCreateEjs = fs.readFileSync('lib/ejs/classCreate.ejs', 'utf-8');
var studyCreateEjs = fs.readFileSync('lib/ejs/Study/StudyCreate.ejs', 'utf-8');
var studyUpdateEjs = fs.readFileSync('lib/ejs/Study/StudyUpdate.ejs', 'utf-8');
var inputChapterEjs = fs.readFileSync('lib/ejs/inputChapter.ejs', 'utf-8');
var deleteEjs = fs.readFileSync('lib/ejs/delete.ejs', 'utf-8');
var submitHomeworkEjs = fs.readFileSync('lib/ejs/submitHomework.ejs', 'utf-8');

app.use(bodyParser.urlencoded({ extended : false }));

// file upload 모듈
var multer = require('multer'); 

var _storage = multer.diskStorage({
    destination: function(request, file, cb){
      // image 파일일 때
      if(file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png"){
        console.log("image file upload");
        cb(null, 'uploads/images')
      } 
      // text 파일이면
      else if(file.mimetype == "application/pdf" || file.mimetype == "application/txt" ||
      file.mimetype == "application/octet-stream" || file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
        console.log("텍스트 파일이네요");
        cb(null, 'uploads/texts');
      }
      // ppt 파일이면
      else if(file.mimetype == "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
        file.mimetype == "application/vnd.ms-powerpoint"){
        console.log('ppt 파일 업로드');
        cb(null, 'uploads/ppts');
      }
      // 알집 파일일 때
      else if(file.mimetype == "application/x-zip-compressed"){
        console.log('알집 파일 업로드');
        cb(null, 'uploads/zips');
      }
      // 기타 파일 업로드 할 때
      else {
        console.log("기타파일 업로드");
        console.log(file.mimetype);
        cb(null, 'uploads/etcs')
      }
    },
    // 파일 이름 설정
    filename: function(request, file, cb){
      // 같은 파일이라도 날짜에 따라 다름!
      if(!fs.existsSync(file.path)){
        cb(null, Date.now() + '_' +file.originalname);
      }
    }
});

var upload = multer({storage: _storage}); //dest destination의 줄인말, 파일 업로드 모듈


//메인
router.get('/:communityID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;

    var user = request.user;
    var userName = " ";

    //로그인 안돼있을 시 예외처리 추가했습니다 - 경원
    if(!user){
        response.redirect('/login');
        return;
    }

    var approved = false;
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
        approved = true;
    }

    //다중쿼리 (배너용 커뮤니티sql + 교육 목록sql)
    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var lectureSql = `select displayName, title, description, cid from users, class where users.id = class.author and class.communityID = ?;`;
    var lectureSqls = mysql.format(lectureSql, communityID);

    var lectures = [];
    var banner =" ";


    db.query(communitySqls + lectureSqls, function(err, result){
        if(err){
            throw(err);
        }else{
            //banner
            var communityName = result[0][0].communityName;
            var introduction = result[0][0].introduction;
            var masterId = result[0][0].masterId;
            
            // masterId가 맞으면 커뮤니티 삭제가 나옴
            var control = ``;
            if(approved){
                if(masterId == user.id){
                    control = `
                    <div class="ph-float">
                        <form action="/community/${communityID}/community_delete" method="post" 
                        onsubmit="return confirm('정말로 이 커뮤니티를 삭제하실건가요?')">
                            <input class="ph-button ph-btn-deepgreen" type="submit" value="커뮤니티 삭제">
                            <input type="hidden" name="communityID" value="${communityID}">
                        </form>
                    </div>
                    `;
                } else {
                    control = ``;
                }
            }

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            var chapterSql = `select title from chapter where class_id = ?;`;

            //교육 카드 생성
            for(var i in result[1]){
                var author = result[1][i].displayName;
                var title = result[1][i].title;
                var description = result[1][i].description;
                var classID = result[1][i].cid;
                
                lectures.push(ejs.render(lectureEjs,{
                    author: author,
                    title: title,
                    description: description,
                    communityID: communityID,
                    classID: classID
                }));
                
            }

            var message = '';
            if(lectures.length == 0){
                message = `강의가 없습니다!`;
            }

            //main content
            var home = ejs.render(communityTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: `
                <div class="communityback">
                    <div class="communitybar">
                        <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                        <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                        <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                    </div>
                    <div class="ph-container">
                        <div class="ph-float">
                            <a href="/community/${communityID}/lectures/class_create" class="ph-button ph-btn-deepgreen">강의생성</a>
                        </div>
                        ${control}
                    </div>
                    ${ejs.render(lecturesViewEjs, {
                        lectures: lectures,
                        message: message
                    })}
                </div>
                `
            });
                
            response.send(home);
        }
    });
});


//교육 게시판 
router.get('/:communityID/lectures', function(request, response){
    var communityID = path.parse(request.params.communityID).base;

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    //다중쿼리 (배너용 커뮤니티sql + 교육 목록sql)
    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var lectureSql = `select displayName, title, description, cid from users, class where users.id = class.author and class.communityID = ?;`;
    var lectureSqls = mysql.format(lectureSql, communityID);

    var lectures = [];
    var banner =" ";

    db.query(communitySqls + lectureSqls, function(err, result){
        if(err){
            throw(err);
        }else{
            //banner
            var communityName = result[0][0].communityName;
            var introduction = result[0][0].introduction;
            var masterId = result[0][0].masterId;

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });
        
            // masterId가 맞으면 커뮤니티 삭제가 나옴
            var control = ``;
            if(masterId == user.id){
                control = `
                <div class="ph-float">
                    <form action="/community/${communityID}/community_delete" method="post" 
                    onsubmit="return confirm('정말로 이 커뮤니티를 삭제하실건가요?')">
                        <input class="ph-button ph-btn-deepgreen" type="submit" value="커뮤니티 삭제">
                        <input type="hidden" name="communityID" value="${communityID}">
                    </form>
                </div>
                `;
            }

            //교육 카드 생성
            for(var i in result[1]){
                var author = result[1][i].displayName;
                var title = result[1][i].title;
                var description = result[1][i].description;
                var classID = result[1][i].cid;

                lectures.push(ejs.render(lectureEjs,{
                    author: author,
                    title: title,
                    description: description,
                    communityID: communityID,
                    classID: classID
                }));
            }

            var message = '';
            if(lectures.length == 0){
              message = `강의가 없습니다!`;
            } 

            //main content
            var home = ejs.render(communityTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: `
                <div class="communityback">
                    <div class="communitybar">
                        <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                        <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                        <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                    </div>
                    <div class="ph-container">
                        <div class="ph-float">
                            <a href="/community/${communityID}/lectures/class_create" class="ph-button ph-btn-deepgreen">강의생성</a>
                        </div>
                        ${control}
                    </div>
                    ${ejs.render(lecturesViewEjs, {
                        lectures: lectures,
                        message: message
                    })}
                </div>
                `
            });
                
            response.send(home);
        }
    });

});

// 강의 생성
router.get('/:communityID/lectures/class_create', function(request, response){
    var communityID = path.parse(request.params.communityID).base;

    var user = request.user; //user 변수에 로그인한 user 정보를 저장
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }else{
        response.redirect('/login');
        return;
    }

    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var banner =" ";
    db.query(communitySqls, function(err, result){
        if(err) throw err;
        else{
            //banner
            var communityName = result[0].communityName;
            var introduction = result[0].introduction;

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            var control = `
                <form action="/community/${communityID}/lectures/class_create" method="post" style="color:black;">
                    <h2 class="blackcolor">강의 생성
                        <small>생성 버튼을 누르면 강의 페이지가 생성됩니다.</small>
                    </h2>
                    <div class="createContainer">
                        <div class="group">
                            <input type="text" name="title" placeholder="강의명 입력(ex. JAVA)" class="createText">
                        </div>
                        <div class="group">
                            <input type="text" name="description" placeholder="강의 간단한 소개" class="createText">
                        </div>
                        <div class="buttonContainer">    
                            <input type="submit" value="강의 생성" class="ph-button ph-btn-deepgreen">
                        </div>
                    </div>    
                </form>
            `;

            var home = ejs.render(CreateTemplateEjs,{
                userName: userName,
                banner: banner,
                communitiesTile: `
                        <div class="communitybar">
                            <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                            <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                            <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>  
                        </div>
                        ${ejs.render(classCreateEjs, {
                            control: control
                        })}        
                    
                ` 
            });

            response.send(home);
        }
    });

    
});

// 강의 생성 프로세스
// 강의 생성을 할 때 강의명, 강의 소개를 받아 강의를 생성한다.
router.post('/:communityID/lectures/class_create', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var post = request.body;
    console.log(post);

    var user = request.user; //user 변수에 로그인한 user 정보를 저장
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }else{
        response.redirect('/login');
        return;
    }
    
    //chapterNum 아얘 빼버림 사용하지 않는 애트리뷰트
    db.query(`INSERT INTO class(title, description, created, author, communityID)
    VALUES (?, ?, NOW(), ?, ?)`,
    [post.title, post.description, user.id, communityID], function(error){
        if(error) throw error;
        response.redirect(`/community/${communityID}`);
    });
    
});

//**************  교육자, 사용자 구분 변경 -> 챕터 메인, 선택 동일  */
//챕터 메인
router.get('/:communityID/lectures/:classID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }else{ // 추가 된 부분_191113
        response.redirect('/login');
        return;
    }

    
    //다중쿼리 (배너용 커뮤니티sql + 챕터sql + 클래스sql)
    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var chapterSql = `select * from chapter where class_id = ?;`;
    var chapterSqls = mysql.format(chapterSql, classID);

    var classSql = `SELECT * FROM class WHERE cid = ?;`;
    var classSqls = mysql.format(classSql, classID);

    var banner =" ";

    db.query(communitySqls + chapterSqls + classSqls, function(err, result){
        if(err){
            throw(err);
        }else{
            //banner
            var communityName = result[0][0].communityName;
            var introduction = result[0][0].introduction;

            //class 저자 확인
            var authorId = result[2][0].author;
            //console.log(authorId);
            //console.log('current userId : ' + user.id);

            var buttons = ``;
            if(authorId == user.id){
                buttons = `
                <div class="ph-container">
                    <div class="ph-float">
                        <a href="/community/${communityID}/lectures/${classID}/add_chapter" class="ph-button ph-btn-deepgreen">
                        챕터추가</a>
                    </div>
                    <div class="ph-float">
                        <form action="/community/${communityID}/class_delete" method="post" 
                        onsubmit="return confirm('정말로 이 강의를 삭제하실건가요?')">
                            <input class="ph-button ph-btn-deepgreen" type="submit" value="강의삭제">
                            <input type="hidden" name="classID" value="${classID}">
                        </form>
                    </div>           
                </div>
                `;
            } else {
                buttons = ``;
            }

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            //chapter
            var chapterID = [];
            var title = [];
            var description = [];
            
            for(var i in result[1]){
                chapterID[i] = result[1][i].id;
                title[i] = result[1][i].title;
                description[i] = result[1][i].description;
            }

            //class
            var classTitle = result[2][0].title;
            var chapterNum = result[2][0].chapterNum;

            //홈
            var home = ejs.render(communityTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: `
                <div class="communityback">
                    <div class="communitybar">
                        <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                        <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                        <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                    </div>
                    <div style="margin: 0.5em;">
                        ${buttons}
                    </div>
                    ${ejs.render(classEjs, {
                        communityID: communityID,
                        classID: classID,
                        chapterID: chapterID,
                        title: title,
                        description: description[0],
                        filedata: null
                    })}
                </div>
                `
            });
            
            response.send(home);
        }
    });
});


//챕터 추가
router.get('/:communityID/lectures/:classID/add_chapter', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;

    var user = request.user; //user 변수에 로그인한 user 정보를 저장
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var banner =" ";
    db.query(communitySqls, function(err, result){
        if(err) throw err;
        else{
            //banner
            var communityName = result[0].communityName;
            var introduction = result[0].introduction;

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            var control = `
                <form action="/community/${communityID}/lectures/${classID}/add_chapter" method="post" style="color:black;">
                    <h2 class="blackcolor">챕터 추가
                        <small>입력 버튼을 누르면 챕터 추가 다음 단계로 넘어갑니다.</small>
                    </h2>
                    <div class="createContainer">
                        <div class="group">
                            <input type="text" name="chapter_num" placeholder="챕터 수 입력(ex. 5)" class="createText">
                        </div>
                        <div class="buttonContainer">
                            <input type="submit" value="입력" class="ph-button ph-btn-deepgreen">
                        </div>
                    </div>
                </form>
            `;

            var home = ejs.render(CreateTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: `
                <div class="communitybar">
                    <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                    <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                    <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                </div>
                ${ejs.render(classCreateEjs, {
                    control: control
                })}    
                `
            });

            response.send(home);
        }
    });
});

//챕터 추가 프로세스
router.post('/:communityID/lectures/:classID/add_chapter', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;

    var post = request.body;
    //console.log(post);
    var chapNum = post.chapter_num;

    var user = request.user; //user 변수에 로그인한 user 정보를 저장
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var banner =" ";

    db.query(communitySqls, function(err, result){
        if(err) throw err;
        else{
            //banner
            var communityName = result[0].communityName;
            var introduction = result[0].introduction;

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            var home = ejs.render(CreateTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: `
                <div class="communitybar">
                    <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                    <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                    <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                </div>
                ${ejs.render(inputChapterEjs, {
                    chapNum: chapNum,
                    communityID : communityID,
                    classID: classID
                })}
                `
            });

            response.send(home);
        }
    });
});

// 챕터 생성 프로세스
router.post('/:communityID/lectures/:classID/chapter_create', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    
    var post = request.body;
    
    var obj_length = Object.keys(post).length; // 넘겨받은 데이터 객체의 길이
    
    var user = request.user; //user 변수에 로그인한 user 정보를 저장
    var userName = " ";
    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }
    
    var i = 0;
    var arr = Object.values(post); // 넘겨받은 챕터 명의 값들
    while(i < obj_length - 1){
        db.query(`INSERT INTO chapter(title, class_id) VALUES(?, ?)`,
        [arr[i], classID], function(error){
            if(error) throw error;
        });
        i++;
    }
    /* chapNum을 업데이트 하려 했는데 필요가 없어짐!
    db.query(`SELECT * FROM class WHERE cid = ?`, [classID], function(error, result){
        if(error) throw error;
        if(result[0].chapterNum !== 0){
            var chapterNum = parseInt(result[0].chapterNum) + parseInt(post.chapNum);
            db.query(`UPDATE class SET chapterNum = ? WHERE cid = ?`, [chapterNum, classID], function(err){
                if(err) throw err;
            });
        }
    });*/

    response.redirect(`/community/${communityID}/lectures/${classID}`);
});

//과제 제출
router.get('/:communityID/lectures/:classID/:chapterID/homework', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var curChapter = path.parse(request.params.chapterID).base;

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }else{
        response.redirect('/login');
        return;
    }

    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var chapterSql = `select * from chapter where class_id = ?;`;
    var chapterSqls = mysql.format(chapterSql, classID);

    var banner =" ";

    db.query(communitySqls + chapterSqls, function(err, result){
        if(err) 
            throw err;
        else{
            //banner
            var communityName = result[0][0].communityName;
            var introduction = result[0][0].introduction;

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            //chapter
            var title = [];
            var chapterID = [];
            var chapterTitle = " ";
            for(var i in result[1]){
                title[i] = result[1][i].title;
                chapterID[i] = result[1][i].id;
                //현재 챕터 타이틀 저장
                if(curChapter == chapterID[i]){
                    chapterTitle = title[i];
                }
            }

            //과제 전송 링크
            var _inputlink = `/${communityID}/lectures/${classID}/${curChapter}/homework`;

            var home = ejs.render(communityTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: `
                <div style="display: inline; background-color: #FFF; width: 100%;">
                    <div class="communitybar">
                        <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                        <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                        <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                    </div>
                    <div>
                        <div class="ph-float-right">
                            <a onclick="document.getElementById('frm').submit();" href="#" class="ph-button ph-btn-deepgreen">
                            제출</a>
                        </div>
                    </div>
                        ${ejs.render(submitHomeworkEjs,{
                            communityID: communityID,
                            chapterTitle: chapterTitle,
                            classID: classID,
                            chapterID: chapterID,
                            title: title,    
                            inputlink: _inputlink,
                        })}
                </div>
                `
            });
            response.send(home);
         }
    });    
});


//과제 전송 프로세스
router.post('/:communityID/lectures/:classID/:chapterID/homework', upload.single('file'), function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var curChapter = path.parse(request.params.chapterID).base;
    
    var post = request.body;
    //console.log(post);
    var file = request.file;
    //console.log(file);

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }else{
        response.redirect('/login');
        return;
    }

    // 과제 존재 확인
    var selectTask =`SELECT * FROM task_board WHERE author = ? and cid = ?;`;
    var selectTaskSql = mysql.format(selectTask, [user.id, curChapter]);
    
    // 과제 파일 존재 확인
    var selectTaskFile = `SELECT * FROM taskfile WHERE author = ? and chapId = ? and classId = ?;`;
    var selectTaskFileSql = mysql.format(selectTaskFile, [user.id, curChapter, classID]);


    db.query(selectTaskSql + selectTaskFileSql, function(err, tasks){
        //console.log(tasks[0]);
        if(tasks[0].length !== 0){
            console.log('task 존재 update 할 것');

            // 기존 파일이 있다면 파일 지우기를 해야함
            if(tasks[1].length !== 0){
                console.log('taskfile 존재 파일 지우기 실행');
                //console.log(tasks[1]);
                // 파일 지우기
                fs.unlinkSync(`${tasks[1][0].filepath}`, function(error2){
                    if(error2) throw error2;
                    else{
                        console.log('수정 파일 delete success');
                    }
                });
                //task_board 테이블에 과제 업데이트
                db.query(`UPDATE task_board SET title = ?, description = ?, upload_date = NOW() 
                WHERE author = ? and cid = ?`, [post.chapterTitle, post.content, user.id, curChapter], function(err2){
                    if(err2) throw err2;
                    else{
                        if(file != undefined){
                            db.query(`UPDATE taskfile SET filename = ?, filepath = ? WHERE author = ? and classId = ? and chapId = ?`,
                            [file.originalname, file.path, user.id, classID, curChapter], function(err3){
                                if(err3) throw err3;
                            });
                        }
                        response.redirect(`/community/${communityID}/lectures/${classID}/${curChapter}`);
                    }
                });

            } else {
                //task_board 테이블에 과제 업데이트
                db.query(`UPDATE task_board SET title = ?, description = ?, upload_date = NOW() 
                WHERE author = ? and cid = ?`, [post.chapterTitle, post.content, user.id, curChapter], function(err2){
                    if(err2) throw err2;
                    else{
                        if(file != undefined){
                            db.query(`UPDATE taskfile SET filename = ?, filepath = ? WHERE author = ? and classId = ? and chapId = ?`,
                            [file.originalname, file.path, user.id, classID, curChapter], function(err3){
                                if(err3) throw err3;
                            });
                        }
                        response.redirect(`/community/${communityID}/lectures/${classID}/${curChapter}`);
                    }
                });
            }

            
        }else{
            console.log('task 없음 insert 가능');
            //task_board 테이블에 과제 추가
            db.query(`INSERT INTO task_board(title, description, upload_date, author, cid)
                VALUES(?, ?, NOW(), ?, ?)`,[post.chapterTitle, post.content, user.id, curChapter], function(error){
                if(error) throw error;
                else{
                    // popup.window({
                    //     mode: 'alert',
                    //     content: '과제가 제출되었습니다.'
                    // });

                    // 피피티 파일위치를 디비에 저장 filepath가 있을 시에!
                    if(file != undefined){
                        //console.log(request.file.path);

                        // db에 파일경로 저장하기~~~ taskfile 이라는 table 을 새로 만들었습니다!
                        db.query(`INSERT INTO taskfile(chapId, classId, filename, filepath, author) VALUES (?, ?, ?, ?, ?)`, 
                        [curChapter, classID, file.originalname, file.path, user.id],
                        function(){
                            console.log('filepath insert into taskfile table!!!');
                        });
                    }
                    response.redirect(`/community/${communityID}/lectures/${classID}/${curChapter}`);
                }
            });
        }
    });
    
    //response.redirect(`/community/${communityID}/lectures/${classID}/${curChapter}`);
});

//챕터 선택
router.get('/:communityID/lectures/:classID/:chapterID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var curChapter = path.parse(request.params.chapterID).base;

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }else{
        response.redirect('/login');
        return;
    }

    
    //다중쿼리 (배너용 커뮤니티sql + 챕터sql)
    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var chapterSql = `select * from chapter where class_id = ?;`;
    var chapterSqls = mysql.format(chapterSql, classID);

    var chapDescSql = `select * from chapter where class_id = ? and id = ?;`;
    var chapDescSqls = mysql.format(chapDescSql, [classID, curChapter]);

    // 추가 된 부분 _191112
    var classSql = `SELECT * FROM class WHERE cid = ?;`;
    var classSqls = mysql.format(classSql, classID);

    var fileSql = `SELECT * FROM testfile WHERE chapId = ? and classId = ?;`;
    var fileSqls = mysql.format(fileSql, [curChapter, classID]);

    var banner =" ";

    db.query(communitySqls + chapterSqls + chapDescSqls + classSqls + fileSqls, function(err, result){
        if(err){
            throw(err);
        }else{
            //banner
            var communityName = result[0][0].communityName;
            var introduction = result[0][0].introduction;

            

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });


            //chapter
            var title = [];
            var chapterID = [];
            for(var i in result[1]){
                title[i] = result[1][i].title;
                chapterID[i] = result[1][i].id;
            }

            // 선택한 챕터 내용 가져오기!
            var chapDesc = result[2][0].description;
            
            //class 저자 확인 추가 된 부분 시작 _ 191112
            var authorId = result[3][0].author;
            
            var filedata = result[4];
            //console.log(filedata);

            var buttons = ``;
            if(user.id == authorId){
                buttons = `
                    <div class="ph-float">
                        <a href="/community/${communityID}/lectures/${classID}/${curChapter}/study_create" class="ph-button ph-btn-deepgreen">
                        교육자료생성</a>
                    </div>
                    <div class="ph-float">
                        <a href="/community/${communityID}/lectures/${classID}/${curChapter}/study_update" class="ph-button ph-btn-deepgreen">
                        교육자료수정</a>
                    </div>
                    ${ejs.render(deleteEjs, {
                        communityID: communityID,
                        classID: classID,
                        chapterID: curChapter,
                        filedata: filedata
                    })}
                `
            }else{
                buttons= `
                <div class="ph-float" style="float: right; margin-right: 2.5em;">
                    <a href="/community/${communityID}/lectures/${classID}/${curChapter}/homework" class="ph-button ph-btn-deepgreen">
                    과제제출</a>
                </div>
                `
            }
            //홈
            var home = ejs.render(communityTemplateEjs, {
                userName: userName,
                banner: banner,
                communitiesTile: `
                <div class="communityback">
                    <div class="communitybar">
                        <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                        <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                        <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                    </div>
                    ${buttons}
                    ${ejs.render(classEjs, {
                        communityID: communityID,
                        classID: classID,
                        chapterID: chapterID,
                        selectCid: curChapter,
                        title: title,
                        description: chapDesc,
                        filedata: filedata
                    })}
                </div>
                `
            });
            response.send(home);
        }
    });
});

//교육 자료 수정 부분
router.get('/:communityID/lectures/:classID/:chapterID/study_update', function(request, response){

    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var chapterID = path.parse(request.params.chapterID).base;

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    //다중쿼리 (배너용 커뮤니티sql + 챕터sql)
    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var banner =" ";

    db.query(communitySqls, function(err, result){
        if(err){
            throw(err);
        }else{
            //banner
            var communityName = result[0].communityName;
            var introduction = result[0].introduction;

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            // 원래 저장되어 있는 파일 데이터의 정보를 가져옴
            var filedataSql = `SELECT * FROM testfile WHERE chapId =? and classId = ?;`;
            var filedataSqls = mysql.format(filedataSql, [chapterID, classID]);

            // 지금 선택된 챕터의 내용을 바꾸고 싶을 때 가져올 정보 : 선택된 챕터의 title, description
            var chapterSql = `SELECT * FROM chapter WHERE class_id = ? and id = ?;`;
            var chapterSqls = mysql.format(chapterSql, [classID, chapterID]);

            db.query(filedataSqls + chapterSqls, function(error, datas){
                if(error){
                    throw error;
                } else{
                    var chapterTitle = datas[1][0].title;
                    var chapterDescription = datas[1][0].description;

                    var home = ejs.render(CreateTemplateEjs,{
                        userName: userName,
                        banner: banner,
                        communitiesTile: `
                        <div class="communitybar">
                            <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                            <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                            <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                        </div>
                        ${ejs.render(studyUpdateEjs,{
                            userName: userName,
                            banner:banner,
                            communityID: communityID,
                            classID: classID,
                            chapterID: chapterID,
                            filedata: datas[0],
                            chapterTitle: chapterTitle,
                            chapterDescription: chapterDescription})
                        }
                        ` 
                    });

                    response.send(home);
                }
            });            
        }
    });
});

//교육 자료 수정 프로세스
router.post('/:communityID/lectures/:classID/:chapterID/study_update', upload.single('file'),
    function(request, response){

    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var curChapter = path.parse(request.params.chapterID).base;

    var post = request.body;

    var file = request.file;

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    // update query문
    var updateSql = `UPDATE chapter SET title = ?, description = ? WHERE id = ? and class_id = ?;`;
    var updateSqls = mysql.format(updateSql, [post.title, post.description, curChapter, classID]);

    db.query(updateSqls, function(err){
        if(err) throw err;
        else{

            // 파일이 있을 때?
            if(file != undefined){
                if (post.fileId1 == undefined){ // 파일이 원래 존재하지 않을 때
                    console.log('oh my gosh');

                    // db에 파일경로 저장까지는 됌!
                    db.query(`INSERT INTO testfile(chapId, classId, filename, filepath) VALUES (?, ?, ?, ?)`, 
                    [curChapter, classID, request.file.originalname, request.file.path],
                    function(){
                        console.log('filepath insert into testfile table!!!');
                    });
                }
                else{
                    var fileSql = `SELECT * FROM testfile WHERE fid = ?`;
                    var fileSqls = mysql.format(fileSql, post.fileId1);

                    db.query(fileSqls, function(error, files){
                        if(error) throw error;
                        else {
                            if(files[0].filepath === file.path){
                                console.log("수정 안해도 됨!");
                            } else{
                                fs.unlinkSync(`${files[0].filepath}`, function(error2){
                                    if(error2) throw error2;
                                    else{
                                        console.log('수정 파일 delete success');
                                    }
                                });

                                // 수정 된 후 파일의 이름 경로를 바꿔주기
                                var updateFile = `UPDATE testfile SET filename =?, filepath =? WHERE fid = ?;`;
                                var updateFileSql = mysql.format(updateFile, [file.originalname, file.path, post.fileId1]);

                                db.query(updateFileSql, function(error3){
                                    if(error3) throw error3;
                                });
                            }
                        }
                    });
                }
                
            }
        }
    })

    response.redirect(`/community/${communityID}/lectures/${classID}/${curChapter}`);
    //response.send('succeess');
});


// 교육자료생성 생성
router.get('/:communityID/lectures/:classID/:chapterID/study_create', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var curChapter = path.parse(request.params.chapterID).base;

    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    //다중쿼리 (배너용 커뮤니티sql + 챕터sql)
    var communitySql = `select * from communities where id = ?;`;
    var communitySqls = mysql.format(communitySql, communityID);

    var banner =" ";

    db.query(communitySqls, function(err, result){
        if(err){
            throw(err);
        }else{
            //banner
            var communityName = result[0].communityName;
            var introduction = result[0].introduction;

            banner = ejs.render(bannerEjs, {
                communityName: communityName,
                introduction: introduction,
                communityID: communityID
            });

            var chapDescSql = `select * from chapter where class_id = ? and id = ?;`;
            var chapDescSqls = mysql.format(chapDescSql, [classID, curChapter]);
            db.query(chapDescSqls, function(err2, chap){
                if(err2) throw err2;
                var home = ejs.render(CreateTemplateEjs,{
                    userName: userName,
                    banner: banner,
                    communitiesTile: `
                    <div class="communitybar">
                        <div style="flex: 1;"><a href="/My/stud/${communityID}">My</a></div>
                        <div style="flex: 1;"><a href="/community/${communityID}/lectures">교육</a></div>
                        <div style="flex: 1;"><a href="/QnA/${communityID}">게시판</a></div>         
                    </div>
                    ${ejs.render(studyCreateEjs,{
                        userName: userName,
                        banner: banner,
                        communityID: communityID,
                        classID: classID,
                        chapterID: curChapter,
                        studyTitle: chap[0].title})
                    }
                    ` 
                });

                response.send(home);
            });
        }
    });
});

// 교육자료 생성 프로세스
router.post('/:communityID/lectures/:classID/:chapterID/study_create', upload.single('file'),function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var curChapter = path.parse(request.params.chapterID).base;
    var post = request.body;
    
    var user = request.user;
    var userName = " ";

    //로그인되어있을 시 닉네임 전달
    if(user){
        userName = user.displayName;
    }

    var file = request.file;
    console.log(file);

    // 1. description 에 들어온 내용 수정하기
    db.query(`UPDATE chapter SET description = ? WHERE class_id = ? and id = ?`
    , [post.description, classID, curChapter],
    function(error, result){
        if(error) throw error;

        // 피피티 파일위치를 디비에 저장 filepath가 있을 시에!
      if(request.file != undefined){
        //console.log(request.file.path);

        // db에 파일경로 저장까지는 됌!
        db.query(`INSERT INTO testfile(chapId, classId, filename, filepath) VALUES (?, ?, ?, ?)`, 
          [curChapter, classID, request.file.originalname, request.file.path],
          function(){
            console.log('filepath insert into testfile table!!!');
          });
      }

    });

    response.redirect(`/community/${communityID}/lectures/${classID}/${curChapter}`);
});

// 파일 다운로드 눌렀을 때 작동
router.get('/:communityID/lectures/:classID/:chapterID/Files/:fileId', function(request, response){
    var fileId = path.parse(request.params.fileId).base;
    db.query(`SELECT * FROM testfile WHERE fid = ?`, [fileId], function(error, file){
        if(error) throw error;
        var file = file[0].filepath;
        
        response.download(file);
    });
});



/* 삭제 부분 추가 */
// 커뮤니티 삭제 프로세스 (커뮤니티를 생성한 자에게만 보이게 만들 것 ** masterId 이용) 191113

/*
    1. 업로드한 파일들 부터 삭제를 한다.(성공)
    2. mysql 삭제 
    (testfile 삭제, chapter 삭제, class 삭제, community 삭제)
*/
router.post('/:communityID/community_delete', function(request, response){
    var post = request.body;
    var communityID = path.parse(request.params.communityID).base;

    //classId 검색
    var selectCid = `SELECT * FROM class WHERE communityID = ?;`;
    var selectCidSqls = mysql.format(selectCid, communityID);

    var classId = [];

    db.query(selectCidSqls, function(error, lectures){
        if(error) throw error;
        //console.log(lectures);
        
        for(var i = 0; i<lectures.length; i ++){
            classId[i] = lectures[i].cid;
        }
        
        
        // select testfile sql
        var selectFile = `SELECT * FROM testfile WHERE classID = ?;`;
        var selectFileSql = [];
        
        
        for(var i = 0; i<lectures.length; i ++){
            selectFileSql[i] = mysql.format(selectFile, classId[i]);
            //파일 삭제
            db.query(selectFileSql[i], function(error2, files){
                if(error2) throw error2;
                else{
                    //console.log(files);
                    var obj_length = Object.keys(files).length;
                    var i = 0;
                    while(i < obj_length){
                        fs.unlinkSync(`${files[i].filepath}`, function(err){// 폴더에 있는 파일 삭제
                            if(err) throw err;
                        });
                        i++;
                    }
                }
            });
        }
        console.log(classId);
        // delete sql
        var deleteFile = `DELETE FROM testfile WHERE classId = ?;`;
        var deleteFileSql = [];

        var deleteChapter = `DELETE FROM chapter WHERE class_id = ?;`;
        var deleteChapterSql = [];

        var deleteClass = `DELETE FROM class WHERE cid = ?;`;
        var deleteClassSql = [];
        
        //mysql 삭제
        for(var i = 0; i<lectures.length; i++){
            deleteFileSql[i] = mysql.format(deleteFile, classId[i]);
            deleteChapterSql[i] = mysql.format(deleteChapter, classId[i]);
            deleteClassSql[i] = mysql.format(deleteClass, classId[i]);
        }
        for(var i = 0; i<lectures.length; i++){
            console.log(deleteFileSql[i]);
            console.log(deleteChapterSql[i]);
            console.log(deleteClassSql[i]);
        
            /*  1. testfile delete
                2. chapter  delete
                3. class    delete
            */
            db.query(deleteFileSql[i], function(error2){
                if(error2) throw error2;
            });
            db.query(deleteChapterSql[i], function(error3){
                    if(error3) throw error3;
                    
            });
            db.query(deleteClassSql[i], function(error4){
                if(error4) throw error4;
            });
        }        
    });

    // 마지막 커뮤니티 삭제
    var deleteCommunity = `DELETE FROM communities WHERE id = ?;`;
    var deleteCommunitySql = mysql.format(deleteCommunity, communityID);
    
    db.query(deleteCommunitySql, function(err){
        if(err) throw err;
    });
    response.redirect(`/home/`);
});

//강의 삭제 프로세스 (강의를 누르면 강의삭제 버튼이 있습니다!)
router.post('/:communityID/class_delete', function(request, response){
    var post = request.body;

    var communityID = path.parse(request.params.communityID).base;
    var classID = post.classID;

    // select testfile sql
    var selectFile = `SELECT * FROM testfile WHERE classID = ?;`;
    var selectFileSql = mysql.format(selectFile, classID);

    // 파일 삭제
    db.query(selectFileSql, function(error, files){
        if(error) throw error;
        
        var obj_length = Object.keys(files).length;
        
        var i = 0;
        while(i < obj_length){
            fs.unlinkSync(`${files[i].filepath}`, function(err2){ //파일 삭제
                if(err2) throw err2;
                console.log('file delete success');
            });
            i++;
        }
    });
    
    // delete sql
    var deleteFile = `DELETE FROM testfile WHERE classId = ?;`;
    var deleteFileSql = mysql.format(deleteFile, classID);

    var deleteChapter = `DELETE FROM chapter WHERE class_id = ?;`;
    var deleteChapterSql = mysql.format(deleteChapter, classID);

    var deleteClass = `DELETE FROM class WHERE cid = ?;`;
    var deleteClassSql = mysql.format(deleteClass, classID);

    /* 1. testfile delete
       2. chapter  delete
       3. class    delete
    */
    db.query(deleteFileSql, function(error){
        if(error) throw error;
        db.query(deleteChapterSql, function(error2){
            if(error2) throw error2;
            db.query(deleteClassSql, function(error3){
                if(error3) throw error3;
                console.log('delete success');
                
            });
        });
    });
    response.redirect(`/community/${communityID}`);
});

// 챕터 삭제 프로세스
// 1단계 다운로드 될 파일이 있다면 파일을 삭제해 줘야 한다.
// 2단계 챕터를 mysql에서 삭제해 버린다!!!!
router.post('/:communityID/chapter_delete', function(request, response){
    var post = request.body;

    var communityID = path.parse(request.params.communityID).base;
    var classID = post.classID;
    var chapterID = post.chapterID;
    var fileID = post.fileId;

    // select class
    var selectClass = `SELECT * FROM class WHERE cid = ?;`;
    var selectClassSql = mysql.format(selectClass, classID);

    // select file
    var selectFile = `SELECT * FROM testfile WHERE fid = ?`;
    var selectFileSql = mysql.format(selectFile, fileID);

    // update chapterNum
    var updateChapter = `UPDATE class SET chapterNum = ? WHERE cid = ?;`;
    
    // delete chapter
    var deleteChapter = `DELETE FROM chapter WHERE id = ?;`;
    var deleteChapterSql = mysql.format(deleteChapter, chapterID);

    // delete file
    var deleteFile = `DELETE FROM testfile WHERE fid = ?;`;
    var deleteFileSql = mysql.format(deleteFile, fileID);

    db.query(selectClassSql, function(error, selected){
        if(error) throw error;
        var chapNum = selected[0].chapterNum -1;
        var updateChapterSql = mysql.format(updateChapter, [chapNum, classID]);
        if(fileID){ // 다운로드할 파일이 존재할 때
            db.query(selectFileSql, function(err, files){
                if(err) throw err;

                var filepath = files[0].filepath;
                fs.unlinkSync(`${filepath}`, function(err2){ //파일 삭제
                    if(err2) throw err2;
                    console.log('file delete success');
                });

                // 파일 삭제(mysql에 있는 데이터)
                db.query(deleteFileSql, function(err2){
                    if(err2) throw err2;
                    console.log('mysql delete success');
                });
                // 챕터 삭제
                db.query(deleteChapterSql, function(error2){
                    if(error2) throw error2;
                    console.log('mysql delete success');
                });
                // 챕터 숫자 변경 해줌 원래 chapterNum - 1
                db.query(updateChapterSql, function(err){
                    if(err) throw err;
                });
            });
        }else{
            // 챕터 삭제
            db.query(deleteChapterSql, function(error2){
                if(error2) throw error2;
                console.log('mysql delete success');
            });

            // 챕터 숫자 변경 해줌 원래 chapterNum - 1
            db.query(updateChapterSql, function(err){
                if(err) throw err;
            });
        }
        
        response.redirect(`/community/${communityID}/lectures/${classID}`);
    });
});

// 교육자료 삭제 프로세스
// 1단계 description 부분을 NULL로 바꾼다
// 2단계 다운로드 될 파일이 있다면 파일을 삭제해 줘야 한다. mysql과 uploads 폴더에서도!
router.post('/:communityID/study_delete', function(request, response){

    var post = request.body;

    var communityID = path.parse(request.params.communityID).base;
    var classID = post.classID;
    var chapterID = post.chapterID;
    var fileID = post.fileId;

    // update query
    var updateDesc = `UPDATE chapter SET description = null WHERE class_id = ? and id = ?;`;
    var updateDescSql = mysql.format(updateDesc, [classID, chapterID]);

    // select query
    var selectFile = `SELECT * FROM testfile WHERE fid = ?;`;
    var selectFileSql = mysql.format(selectFile, fileID);

    // delete query
    var deleteFile = `DELETE FROM testfile WHERE fid = ?;`;
    var deleteFileSql = mysql.format(deleteFile, fileID);

    db.query(updateDescSql, function(error){ // description = null 로 바꾸기
        if(error) throw error;
        else {
            if(fileID){
                db.query(selectFileSql, function(error2, result){ // 파일 삭제
                    if(error2)throw error2;
                    else{
                        var filepath = result[0].filepath;
                        fs.unlinkSync(`${filepath}`, function(err){
                            if(err) throw err;
                            console.log('file delete success');// 왜 안나오는지 의문..
                        });
                    }
                });

                db.query(deleteFileSql, function(error3){
                    if(error3) throw error3;
                    else{
                        console.log('mysql delete success');
                    }
                });
            }

            
        }
    });
    response.redirect(`/community/${communityID}/lectures/${classID}/${chapterID}`);
});

module.exports = router;