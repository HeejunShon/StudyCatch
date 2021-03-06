var express = require('express');
var router = express.Router();
var path = require('path');

var fs = require('fs');
var ejs = require('ejs');
var url = require('url');

var communityLayout = require('../lib/communityLayout.js');
//ejs
var qnaInputEjs = fs.readFileSync('lib/ejs/QnA/Input.ejs', 'utf8');
var qnaBoardEjs = fs.readFileSync('lib/ejs/QnA/qnaBoard.ejs', 'utf8');
var qnaContentEjs = fs.readFileSync('lib/ejs/QnA/qnaContent.ejs', 'utf8');

var boardTemplateEjs = fs.readFileSync('lib/ejs/boardTemplate.ejs', 'utf8');

var db = require('../lib/database.js');

var d = new Date();
var curDate = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

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


router.get('/qnaInput/:communityID', function (request, response) {

    var communityID = path.parse(request.params.communityID).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";

    if(!user){
        response.redirect('/login');
        return;
    }

    else{
        var _title = '질문 올리기';
        var _inputlink = '/QnA/qnaInput_process';

        //qnaInput에 communityID 추가
        var home = ejs.render(boardTemplateEjs,{
            communityID: communityID,
            board: ejs.render(qnaInputEjs,{
                communityID: communityID,
                title: _title,
                inputlink: _inputlink,
                contentTitle: ``,
                content: ``,
                preview: ``
            }),
        });

        communityLayout.HTML(user, communityID, home, response);
    }
    
});

router.get('/qnaAnswer/:pageId', function (request, response) {

    var filteredId = path.parse(request.params.pageId).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";

    if(!user){
        response.redirect('/login');
        return;
    }

    db.query(`SELECT * FROM QnA_Board WHERE id=?`,
        [filteredId], function (error, result) {
            if (error) {
                throw error;
            }

            else{
                var _title = '질문 답변하기';
                var _inputlink = `/QnA/qnaAnswer_process/${filteredId}`;
        
                var home = ejs.render(boardTemplateEjs,{
                communityID: result[0].communityID,
                board: ejs.render(qnaInputEjs,{
                    communityID: result[0].communityID,
                    title: _title,
                    inputlink: _inputlink,
                    contentTitle: ``,
                    content: ``,
                    preview: ejs.render(qnaContentEjs,{
                        isPreview: true,
                        communityID: result[0].communityID,
                        option: '상태',
                        userName: userName,
                        answerlink: ``,
                        result: result,
                        }),
                    }),
                });
            
                communityLayout.HTML(user, result[0].communityID, home, response);
            }
        })
});

router.get('/qnaModify/:pageId', function (request, response) {

    var filteredId = path.parse(request.params.pageId).base;

    var user = request.user;
    var userName = user ? user.displayName : " ";

    if(!user){
        response.redirect('/login');
        return;
    }

    db.query(`SELECT * FROM QnA_Board WHERE id=?`,
        [filteredId], function (error, result) {
            if (error) {
                throw error;
            }

            else{
                var _title = '질문 수정';
                var _inputlink = `/QnA/qnaModify_process/${filteredId}`;
        
                var home = ejs.render(boardTemplateEjs,{
                communityID: result[0].communityID,
                board: ejs.render(qnaInputEjs,{
                    title: _title,
                    inputlink: _inputlink,
                    contentTitle: result[0].title,
                    content: result[0].qcontent,
                    preview: ``,
                    communityID: result[0].communityID,
                    }),
                });
            
                communityLayout.HTML(user, result[0].communityID, home, response);
            }
        })
});

router.get('/qnaDelete/:pageId', function (request, response) {

    var filteredId = path.parse(request.params.pageId).base;

    var user = request.user;
    if(!user){
        response.redirect('/login');
        return;
    }
    db.query(`SELECT * FROM QnA_Board WHERE id=?`,
        [filteredId], function (error, result) {
            if (error) {
                throw error;
            }

        db.query(`DELETE FROM QnA_Board WHERE id=?`,
            [filteredId], function (error, result2) {
                if (error) {
                    throw error;
                }

                response.redirect(`/QnA/${result[0].communityID}`);
            })
    });
});

router.post('/qnaInput_process', function (request, response) {
    
    var post = request.body;
    var userID = request.user.displayName;

    db.query(`
          INSERT INTO QnA_Board(title, qcontent, qusid, qusdate, communityID) 
          VALUES(?, ?, ?, ?, ?)`,
        [post.title, post.content, userID, curDate, post.communityID], //커뮤니티 아이디 수정 (post.communityID)
        function (error, result) {
            if (error) {
                throw error;
            }

            response.redirect(`/QnA/qnAContent/${result.insertId}`);
        }
    )
});

router.post('/qnaAnswer_process/:pageId', function (request, response) {
  
    var post = request.body;
    var userID = request.user.displayName;

    var filteredId = path.parse(request.params.pageId).base;
    {
        db.query(`
          UPDATE QnA_Board set status=?, answer=?, ansid=?, ansdate=? WHERE id=?`,
            [1, post.content, userID, curDate, filteredId], //수정필요
            function (error, result) {
                if (error) {
                    throw error;
                }

                response.redirect(`/QnA/qnAContent/${filteredId}`);
            }
        )
    }

});

router.post('/qnaModify_process/:pageId', function (request, response) {
  
    var post = request.body;
    var userID = request.user.displayName;

    var filteredId = path.parse(request.params.pageId).base;
    {
        db.query(`
          UPDATE QnA_Board set title=?, qcontent=?, qusdate=? WHERE id=?`,
            [post.title, post.content, curDate, filteredId], //수정필요
            function (error, result) {
                if (error) {
                    throw error;
                }

                response.redirect(`/QnA/qnAContent/${filteredId}`);
            }
        )
    }

});


router.get('/qnAContent/:pageId', function (request, response) {

    var user = request.user;
    var userName = user ? user.displayName : " ";
 
    if(!user){
        response.redirect('/login');
        return;
    }

    var filteredId = path.parse(request.params.pageId).base;

    console.log(filteredId);
    db.query(`SELECT * FROM QnA_Board WHERE id=?`,
        [filteredId], function (error, result) {

            if (error) {
                throw error;
            }

            if(request.user){

                console.log(result);
                var _answerlink = request.user.approved === 'student' ? "" : "답변하기";
    
                var home = ejs.render(boardTemplateEjs,{
                communityID: result[0].communityID,
                board: ejs.render(qnaContentEjs,{
                    isPreview: false,
                    option: '상태',
                    userName: userName,
                    answerlink: _answerlink,
                    result: result,
                    communityID: result[0].communityID,
                    }),
                });
            
                communityLayout.HTML(user, result[0].communityID, home, response);
            }
        });
});

router.get('/:communityID', function (request, response) {

    var communityID = path.parse(request.params.communityID).base;

    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    var _cpage = queryData.cpage != undefined ? parseInt(queryData.cpage) : 1;
    var _cblock = queryData.cblock != undefined ? parseInt(queryData.cblock) : 1;

    var user = request.user;
    var userName = user ? user.displayName : " ";
 
    if(!user){
        response.redirect('/login');
        return;
    }

    db.query(`SELECT * FROM QnA_Board WHERE communityID=? ORDER BY ID DESC`, [communityID], function (err, result) {
        if(err){
            throw(err);
        }else{

            if(request.user){

                var _inputlink = request.user.approved === 'student' ? "질문하기" : "";

                var home = ejs.render(boardTemplateEjs,{
                    communityID: communityID,
                    board: ejs.render(qnaBoardEjs,{
                        title: '질문 게시판',
                        option: '상태',
                        inputlink: _inputlink,
                        pagesize: 4,
                        cpage: _cpage,
                        Board: result,
                        cblock: _cblock,
                        blocksize: 5,
                        communityID: communityID,
                    }),
                });

                communityLayout.HTML(user, communityID, home, response);
            }
        }
    })
});

module.exports = router;