var express = require('express');
var router = express.Router();
var path = require('path');
var db = require('../lib/database.js');
var mysql = require('mysql');

var fs = require('fs');
var ejs = require('ejs');
var url = require('url');

var communityLayout = require('../lib/communityLayout.js');

//ejs
var myTemplateEjs = fs.readFileSync('lib/ejs/My/myTemplate.ejs', 'utf8');
var myClassEjs = fs.readFileSync('lib/ejs/My/myClass.ejs', 'utf8');
var myChapterEjs = fs.readFileSync('lib/ejs/My/myChapter.ejs', 'utf8');
var myHomeworkEjs = fs.readFileSync('lib/ejs/My/myHomework.ejs', 'utf8');

var lecturesViewEjs = fs.readFileSync('lib/ejs/lecturesView.ejs', 'utf8');
var lectureEjs = fs.readFileSync('lib/ejs/lecture.ejs', 'utf8');


//mypage 메인
router.get('/', function (request, response) {
    var html =
    `
    <!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>글 쓰기</title>
      </head>
      
      <body>
      <h1> 오 류 방 지 </h1>
      <h2><a href="/QnA/1">1번 커뮤니티 질문게시판으로 이동</a></h2>
      </body>
      </html>
    `
  response.send(html);
});

// 학생 모드 (수강 중 강의 표시)
router.get('/stud/:communityID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;

    // 로그인 확인
    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }

    console.log('id: ' + user.id);

    //수강 중 클래스(과제 제출한) 쿼리
    var lectureSql = `select distinct displayName, class.title, class.description, class.cid from users, class, chapter, task_board where users.id = class.author and task_board.author = ${user.id} and task_board.cid = chapter.id and chapter.class_id = class.cid and class.communityID = ?;`;
    var lectureSqls = mysql.format(lectureSql, communityID);

    var lectures = [];

    db.query(lectureSqls, function(err, result){

        //교육 카드 생성
        for(var i in result){
            var author = result[i].displayName;
            var title = result[i].title;
            var description = result[i].description;
            var classID = result[i].cid;

            console.log('title: '+title);
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
            message = `과제를 제출해보세요!`;
        }

        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/stud/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(lecturesViewEjs, {
                lectures: lectures,
                message: message
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});

// 학생 과제확인 -> 클래스 목록 표시
router.get('/stud/:communityID/task', function(request, response){
    var communityID = path.parse(request.params.communityID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  
    //수강 중 클래스(과제 제출한) 쿼리
    var lectureSql = `select distinct displayName, class.title, class.description, class.cid from users, class, chapter, task_board where users.id = class.author and task_board.author = ${user.id} and task_board.cid = chapter.id and chapter.class_id = class.cid and class.communityID = ?;`;
    var lectureSqls = mysql.format(lectureSql, communityID);

    var lectures = [];

    db.query(lectureSqls, function(err, result){
        var message = '';
        if(lectures.length == 0){
          message = `과제를 제출해보세요!`;
        }
        console.log(result);

        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/stud/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(myTemplateEjs, {
                classes: ejs.render(myClassEjs, {
                    status: 'stud',
                    name: '클래스',
                    result: result,
                    communityID: communityID
                }),
                homework: ejs.render(myHomeworkEjs,{
                    chapterID: '',
                    userWork: '메인',
                    answer: ``,
                    inputlink: ``,
                    filedata: null
                })
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});

// 학생 과제 확인 -> 클래스 선택 시 (챕터 목록 표시)
router.get('/stud/:communityID/task/:classID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  
    //수강 중 클래스(과제 제출한) 쿼리
    // var lectureSql = `select distinct username, class.title, class.description, class.cid from users, class, chapter, task_board where users.id = class.author and task_board.author = ${user.id} and task_board.cid = chapter.id and chapter.class_id = class.cid and class.communityID = ?;`;
    // var lectureSqls = mysql.format(lectureSql, communityID);


    //클래스에 대한 챕터 쿼리
    var chapterSql = `select * from chapter where class_id = ?;`;
    var chapterSqls = mysql.format(chapterSql, classID);

    var taskSql = `select * from task_board where author = ?;`;
    var taskSqls = mysql.format(taskSql, user.id);

    var lectures = [];

    db.query(chapterSqls + taskSqls, function(err, result){
        var message = '';
        if(lectures.length == 0){
          message = `과제를 제출해보세요!`;
        }


        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/stud/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(myTemplateEjs, {
                classes: ejs.render(myChapterEjs, {
                    status: 'stud',
                    name: '챕터',
                    result: result[0],
                    classID: classID,
                    communityID: communityID
                }),
                homework: ejs.render(myHomeworkEjs,{
                    chapterID: '',
                    userWork: '챕터',
                    answer: ``,
                    inputlink: ``,
                    filedata: null
                })
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});

// 학색 과제 확인 -> 클래스 -> 챕터 선택시 (과제 표시)
// 학생이 제출한 과제에서 업로드한 파일을 다운로드 할 수 있게끔 할거에요!(과제 업로드한 파일 표시까지 함)
// 파일 클릭 시 다운로드만 구현함
router.get('/stud/:communityID/task/:classID/:chapterID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var chapterID = path.parse(request.params.chapterID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  
    //수강 중 클래스(과제 제출한) 쿼리
    // var lectureSql = `select distinct username, class.title, class.description, class.cid from users, class, chapter, task_board where users.id = class.author and task_board.author = ${user.id} and task_board.cid = chapter.id and chapter.class_id = class.cid and class.communityID = ?;`;
    // var lectureSqls = mysql.format(lectureSql, communityID);


    //클래스에 대한 챕터 쿼리
    var chapterSql = `select * from chapter where class_id = ?;`;
    var chapterSqls = mysql.format(chapterSql, classID);

    //학생 과제 쿼리
    var taskSql = `select * from task_board where author = ?;`;
    var taskSqls = mysql.format(taskSql, user.id);

    //과제 답변 쿼리
    var subtaskSql = `select subtask_board.description from subtask_board, task_board, chapter where chapter.id = task_board.cid and task_board.id = subtask_board.task_id and chapter.id = ? and task_board.author = ?;`
    var subtaskSqls = mysql.format(subtaskSql, [chapterID, user.id]);

    // 업로드한 과제 파일 불러오기
    var taskfileSelect = `SELECT * FROM taskfile WHERE author = ? and chapId = ? and classId = ?;`;
    var taskfileSelectSql = mysql.format(taskfileSelect,[user.id, chapterID, classID]);

    var lectures = [];


    db.query(chapterSqls + taskSqls + subtaskSqls + taskfileSelectSql, function(err, result){
        var message = '';
        if(lectures.length == 0){
          message = `과제를 제출해보세요!`;
        }

        console.log('유저워크 ' + result[1].description);

        var filedata = result[3];


        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/stud/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(myTemplateEjs, {
                classes: ejs.render(myChapterEjs, {
                    status: 'stud',
                    name: '챕터',
                    result: result[0],
                    classID: classID,
                    communityID: communityID,
                    chapterID: chapterID
                }),
                homework: ejs.render(myHomeworkEjs,{
                    chapterID: chapterID,
                    userWork: result[1],
                    answer: result[2],
                    inputlink: ``,
                    filedata: filedata
                })
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});

//강사 모드 (생성한 강의 표시)
router.get('/teacher/:communityID/', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
  
    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  
    console.log('id: ' + user.id);
  
    //생성한 클래스 쿼리
    var lectureSql = `select distinct displayName, class.title, class.description, class.cid from users, class where ${user.id} = class.author and users.id = ${user.id} and class.communityID = ?;`;
    var lectureSqls = mysql.format(lectureSql, communityID);
  
    var lectures = [];
  
    db.query(lectureSqls, function(err, result){
  
        console.log('re '+ result);
        //교육 카드 생성
        for(var i in result){
            var author = result[i].displayName;
            var title = result[i].title;
            var description = result[i].description;
            var classID = result[i].cid;
  
            console.log('title: '+title);
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
          message = `강의를 생성해보세요!`;
        }
  
        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/teacher/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(lecturesViewEjs, {
                lectures: lectures,
                message: message
            })}
        `;
  
        communityLayout.HTML(user, communityID, home, response);
    });
  });

// 강사 과제확인 -> 클래스 목록 표시
router.get('/teacher/:communityID/task', function(request, response){
    var communityID = path.parse(request.params.communityID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  
    //생성한 클래스 쿼리
    var lectureSql = `select distinct displayName, class.title, class.description, class.cid from users, class where ${user.id} = class.author and users.id = ${user.id} and class.communityID = ?;`;
    var lectureSqls = mysql.format(lectureSql, communityID);

    var lectures = [];

    db.query(lectureSqls, function(err, result){
        var message = '';
        if(lectures.length == 0){
          message = `과제를 제출해보세요!`;
        }

        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/teacher/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(myTemplateEjs, {
                classes: ejs.render(myClassEjs, {
                    status: 'teacher',
                    name: '클래스',
                    result: result,
                    communityID: communityID
                }),
                homework: ejs.render(myHomeworkEjs,{
                    chapterID: '',
                    userWork: '메인',
                    answer: ``,
                    inputlink: ``,
                    filedata: null
                })
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});

// 강사 과제 확인 -> 클래스 선택 시 (챕터 목록 표시)
router.get('/teacher/:communityID/task/:classID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  
    //수강 중 클래스(과제 제출한) 쿼리
    // var lectureSql = `select distinct username, class.title, class.description, class.cid from users, class, chapter, task_board where users.id = class.author and task_board.author = ${user.id} and task_board.cid = chapter.id and chapter.class_id = class.cid and class.communityID = ?;`;
    // var lectureSqls = mysql.format(lectureSql, communityID);


    //클래스에 대한 챕터 쿼리
    var chapterSql = `select * from chapter where class_id = ?;`;
    var chapterSqls = mysql.format(chapterSql, classID);

    var taskSql = `select * from task_board where author = ?;`;
    var taskSqls = mysql.format(taskSql, user.id);

    var lectures = [];

    db.query(chapterSqls + taskSqls, function(err, result){
        var message = '';
        if(lectures.length == 0){
          message = `과제를 제출해보세요!`;
        }


        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/teacher/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(myTemplateEjs, {
                classes: ejs.render(myChapterEjs, {
                    status: 'teacher',
                    name: '챕터',
                    result: result[0],
                    classID: classID,
                    communityID: communityID
                }),
                homework: ejs.render(myHomeworkEjs,{
                    chapterID: '',
                    userWork: '챕터',
                    answer: ``,
                    inputlink: ``,
                    filedata: null
                })
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});


// 강사 과제 확인 -> 클래스 -> 챕터 선택 시 (과제 제출자 목록 표시)
router.get('/teacher/:communityID/task/:classID/:chapterID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var chapterID = path.parse(request.params.chapterID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  

    //해당 챕터 과제 제출한 유저 목록
    var userSql = `select users.id, users.username, author, description from task_board, users where author = users.id and cid = ?;`;
    var userSqls = mysql.format(userSql, chapterID);

    //과제 
    var taskSql = `select * from task_board where cid = ?;`;
    var taskSqls = mysql.format(taskSql, chapterID);

    var lectures = [];

    db.query(userSqls + taskSqls, function(err, result){
        var message = '';
        if(lectures.length == 0){
          message = `과제를 제출해보세요!`;
        }

        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/teacher/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(myTemplateEjs, {
                classes: ejs.render(myChapterEjs, {
                    status: 'teacher',
                    name: '유저',
                    result: result[0],
                    classID: classID,
                    communityID: communityID,
                    chapterID: chapterID
                }),
                homework: ejs.render(myHomeworkEjs,{
                    chapterID: chapterID,
                    userWork: '유저',
                    answer: ``,
                    inputlink: ``,
                    filedata: null
                })
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});

// 강사 과제 확인 -> 클래스 -> 챕터 -> 유저 목록 선택 시 (유저 과제 표시)
// 유저가 업로드한 과제 표시 및 다운로드할 수 있게 하기!
router.get('/teacher/:communityID/task/:classID/:chapterID/:userID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var chapterID = path.parse(request.params.chapterID).base;
    var userID = path.parse(request.params.userID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }
  
    //해당 챕터 과제 제출한 유저 목록
    var userSql = `select users.id, users.username, author, description from task_board, users where author = users.id and cid = ?;`;
    var userSqls = mysql.format(userSql, chapterID);

    //과제 
    var taskSql = `select * from task_board where cid = ? and author = ?;`;
    var taskSqls = mysql.format(taskSql, [chapterID, userID]);

    //업로드 한 과제 파일 불러오기
    var selectTaskFile = `SELECT * FROM taskfile WHERE author = ? and chapId = ? and classId = ?;`;
    var selectTaskFileSql = mysql.format(selectTaskFile, [userID, chapterID, classID]);

    //과제 답변 쿼리
    // var subtaskSql = `select subtask_board.description from subtask_board, task_board, chapter where chapter.id = task_board.cid and task_board.id = subtask_board.task_id and chapter.id = ?;`
    // var subtaskSqls = mysql.format(subtaskSql, chapterID);
    
    var lectures = [];

    db.query(userSqls + taskSqls + selectTaskFileSql, function(err, result){
        var message = '';
        if(lectures.length == 0){
          message = `과제를 제출해보세요!`;
        }

        console.log('숙: '+result[1]);

        var filedata = result[2];

        //과제 답변 프로세스 링크
        var _inputlink = `teacher/${communityID}/task/${classID}/${chapterID}/${userID}`;

        var home = `
            <div class="ph-container">
                <div class="ph-float">
                    <a href="/My/stud/${communityID}" class="ph-button ph-btn-deepgreen">학생</a>
                </div>
                <div class="ph-float">
                    <a href="/My/teacher/${communityID}" class="ph-button ph-btn-deepgreen">강사</a>
                </div>
                <div class="ph-float-right">
                    <a href="/My/teacher/${communityID}/task" class="ph-button ph-btn-deepgreen">과제확인</a>
                </div>
            </div>
            ${ejs.render(myTemplateEjs, {
                classes: ejs.render(myChapterEjs, {
                    status: 'teacher',
                    name: '유저',
                    result: result[0],
                    classID: classID,
                    communityID: communityID,
                    chapterID: chapterID
                }),
                homework: ejs.render(myHomeworkEjs,{
                    chapterID: chapterID,
                    userWork: result[1],
                    answer: '',
                    inputlink: _inputlink,
                    filedata: filedata
                })
            })}
        `;

        communityLayout.HTML(user, communityID, home, response);
    });
});

// 과제 답변 전송 프로세스
router.post('/teacher/:communityID/task/:classID/:chapterID/:userID', function(request, response){
    var communityID = path.parse(request.params.communityID).base;
    var classID = path.parse(request.params.classID).base;
    var chapterID = path.parse(request.params.chapterID).base;
    var userID = path.parse(request.params.userID).base;
    var post = request.body;
    console.log('post : '+ post.title);

    var user = request.user;
    var userName = user ? user.displayName : " ";
    if(!user){
      response.redirect('/login');
      return;
    }

    //subtask_board 테이블에 추가
    db.query(`INSERT INTO subtask_board(title, description, upload_date, task_id, author)
        VALUES(?, ?, NOW(), ?, ?)`,[post.title, post.content, post.id, user.id], function(error){
        if(error) throw error;
        else{
            response.redirect(`/My/teacher/${communityID}/task/${classID}/${chapterID}/${userID}`);
        }
    });

});

/* 과제 파일 다운로드 기능 */
router.get('/Files/:fileId', function(request, response){
    var fileId = path.parse(request.params.fileId).base;
    db.query(`SELECT * FROM taskfile WHERE tid = ?`, [fileId], function(error, file){
        if(error) throw error;
        var file = file[0].filepath;
        
        response.download(file);
    });
});

module.exports = router;