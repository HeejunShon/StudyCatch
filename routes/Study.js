var express = require('express');
var app = express(); // express 함수 처럼 호출 express는 함수라는 뜻!
var router = express.Router();

// 템플릿 가져오기
var ClassTemplate = require('../lib/Study/ClassTemplate');

var sanitizeHtml = require('sanitize-html');
var path = require('path');

var db = require('../lib/database.js');

var bodyParser = require('body-parser');
var compression = require('compression');

app.use(express.static('public')); // 'public' 폴더에서 static(image, javascript, html, css 등) 파일을 찾겠다
app.use(bodyParser.urlencoded({ extended : false })); // bodyparser가 미들웨어를 만들고 실행됨
app.use(compression()); // data 압축해주는 거

router.get('/', function (request, response) { // 첫번째 인자 '/' 이것은 pathname
  db.query(`SELECT * FROM class`, function(error, topics){ // sql 의 결과가 topics에 담김
    
    
    if(error) throw error;
    var title = 'Welcome';
    var description = '강의를 생성하고 싶다면 \'강의 생성\'버튼을 누르세요!';
    var list = ClassTemplate.list(topics);
    var html = ClassTemplate.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src="/images/taeyeon.jpg" style="width:500px; display:block; margin:10px;">
      `,
      `<p><a href="/Study/class_create">강의생성</a></p>`
    );
    response.send(html);
  });
});

// 강의 생성 페이지
router.get('/class_create', function(request, response){
  db.query(`SELECT * FROM class`, function(error, topics){ // sql 의 결과가 topics에 담김
    if(error) throw error;
    var title = '강의 생성';
    var list = ClassTemplate.list(topics);
    var html = ClassTemplate.HTML(title, list,
      `
      <form action="/Study/class_create_process" method="post">
        <p><input type="text" name="title" placeholder="강의명 입력(ex. JAVA)"></p>
        <p>
          <input type="submit" value="생성">
        </p>
        <p>생성 버튼을 누르면 강의 페이지가 생성됩니다.</p>
      </form>
      `,
      `<p>${title}</p>`
    );
    response.send(html);
  });
});

// 강의 생성 처리
router.post('/class_create_process', function(request, response){
  var post = request.body;
  db.query(`INSERT INTO class(title, description, created, author) 
   VALUES(?, 'test', NOW(), 'hyehye')`, [post.title],
   function(error, result){
    if(error) throw error;
    response.redirect(`/Study/${result.insertId}`);
  });
});

// 강의 클릭시 나타나는 페이지 부분
router.get('/:pageId', function(request, response){
  var filteredId = path.parse(request.params.pageId).base; //pageId 값
  //console.log("filteredId : " + filteredId);
  db.query(`SELECT * FROM class`, function(error, topics){ // sql의 결과가 topics에 담김
    if(error) throw error;
    db.query(`SELECT * FROM class WHERE id=?`, [filteredId], function(error2, topic){ // sql 의 결과가 topic에 담김
      if(error2) throw error2;
      db.query(`SELECT * FROM chapter WHERE class_id=?`, [filteredId], function(error3, chapter_list){
        if(error3) throw error3;
        
        var title = topic[0].title;
        //var description = topic[0].description;
        //var sanitizedTitle = sanitizeHtml(title);
        var list = ClassTemplate.list(topics, chapter_list, filteredId);
        var _body = ClassTemplate.body(title, topic[0].chapterNum);
        var html = ClassTemplate.HTML(title, list, _body,
          `<p><a href="/Study/${filteredId}/chapterNum_create">챕터생성</a></p>
          <p><a href="/Study/${filteredId}/class_update">강의수정</a></p>
          <form action="/Study/${filteredId}/class_delete_process" method="post">
            <input type="hidden" name="id" value="${filteredId}">
            <input type="submit" value="강의삭제">
          </form>`
        );
        response.send(html);
      });
    });
  });
});

//서브페이지 
router.get('/:pageId/Chapter/:chapterId', function(request, response){
  var filteredId = path.parse(request.params.pageId).base;
  var filteredSubId = path.parse(request.params.chapterId).base;
  //console.log("filteredId(상위페이지) : " + filteredId + " filteredSubId(하위페이지) : " + filteredSubId);
  db.query(`SELECT * FROM class`, function(error, topics){
    if(error) throw error;
    //db.query(`SELECT * FROM class WHERE id = ?`, [filteredId], function(error2, topic){
      //if(error2) throw error2;
      db.query(`SELECT * FROM chapter WHERE class_id = ?`, [filteredId], function(error3, chapter_list){
        if(error3) throw error3;
        db.query(`SELECT * FROM chapter WHERE class_id = ? and id = ?`, [filteredId, filteredSubId], function(error4, chapter_desc){
          if(error4) throw error4;
          var upperPage = filteredId;
          var currentPage = filteredSubId;
          //console.log("chapter_desc : " + chapter_desc[0].description);
          var sanitizedUpperPage = sanitizeHtml(upperPage);
          var sanitizedCurruntPage = sanitizeHtml(currentPage);
          //var image = `<img src="uploads/taeyeon.jpg" alt="why">`;
          var list = ClassTemplate.list(topics, chapter_list, filteredId);
          var description = `<p>${chapter_desc[0].description}</p>`; // 챕터 생성시 description 기본 값 넣어주기
          var html = ClassTemplate.HTML(currentPage, list, description,
            ` <p><a href="/Study/${filteredId}/Chapter/${filteredSubId}/study_create">교육자료생성</a></p>
            <p><a href="/Study/${filteredId}/Chapter/${filteredSubId}/study_update">교육자료수정</a></p>
            <form action="/Study/${filteredId}/Chapter/${filteredSubId}/chapter_delete_process" method="post">
              <input type="hidden" name="upperPage" value="${sanitizedUpperPage}">
              <input type="hidden" name="id" value="${sanitizedCurruntPage}">
              <input type="submit" value="교육자료삭제">
            </form>`
          );
          response.send(html);
        });
      });
      
        
    //});
    
  });

});

// chapter 생성 수 레이아웃 부분
router.get('/:pageId/chapterNum_create', function(request, response){
  var filteredId = path.parse(request.params.pageId).base; //pageId 값
  db.query(`SELECT * FROM class`, function(error, topics){ // sql 의 결과가 topics에 담김
    if(error) throw error;

    var title = '챕터 수 생성';
    var list = ClassTemplate.list(topics);
    var html = ClassTemplate.HTML(title, list,
      `
      <form action="/Study/${filteredId}/chapterNum_create_process" method="post">
        <p>
        <input type="text" name="chapter_num" placeholder="챕터 수 입력(ex. 5)">
        </p>
        <p>
          <input type="submit" value="챕터 수 입력">
        </p>
      </form>
      `,
      `<p>${title}</p>`
    );
    response.send(html);
  });
}); 

// chapter 생성 수 처리
router.post('/:pageId/chapterNum_create_process', function(request, response){
  var filteredId = path.parse(request.params.pageId).base; //pageId
  var post = request.body;
  db.query(`UPDATE class SET chapterNum = ? WHERE id = ?`, [post.chapter_num, filteredId],
   function(error, result){
    if(error) throw error;
  });
  response.redirect(`/Study/${filteredId}/chapter_create`);
});

// 챕터 입력 부분
router.get('/:pageId/chapter_create', function(request, response){
  var filteredId = path.parse(request.params.pageId).base; //pageId 값
  //console.log(filteredId);
  db.query(`SELECT * FROM class`, function(error, topics){ // sql 의 결과가 topics에 담김
    if(error) throw error;
    db.query(`SELECT * FROM class WHERE id = ?`, [filteredId], function(error2, chapternum){
      //console.log(chapternum[0].chapterNum);
      var title = '챕터 생성';
      var list = ClassTemplate.list(topics);
      var chapter = ClassTemplate.chapter(chapternum[0].chapterNum);
      var html = ClassTemplate.HTML(title, list,
        `
        <form action="/Study/${filteredId}/chapter_create_process" method="post">
          ${chapter}
          <p>
            <input type="submit" value="챕터 입력">
          </p>
        </form>
        `,
        `<p>${title}</p>`
      );
      response.send(html);
    });
  });
});

// 챕터 입력 처리
router.post('/:pageId/chapter_create_process', function(request, response){
  var filteredId = path.parse(request.params.pageId).base; //pageId 값
  var post = request.body;
  var obj_length = Object.keys(post).length; // 넘겨받은 데이터 객체 길이 
  var i = 0;
  var arr = Object.values(post); // 넘겨받은 챕터 명의 값들
  while(i < obj_length){ //객체 길이만큼 반복
    db.query(`INSERT INTO chapter(title, class_id, description) VALUES(?, ?, '')`, [arr[i], filteredId], 
      function(error, result){
      if(error) throw error; 
    });
    i++;
  }
  response.redirect(`/Study/${filteredId}`);
});

// 교육자료 생성
router.get('/:pageId/Chapter/:chapterId/study_create', function(request, response){
  var filteredId = path.parse(request.params.pageId).base;
  var filteredSubId = path.parse(request.params.chapterId).base;
  db.query(`SELECT * FROM class`, function(error, topics){
    if(error) throw error;
    db.query(`SELECT * FROM chapter WHERE class_id = ?`, [filteredId], function(error2, chapter_list){
      if(error2) throw error2;
      var chapter_index = ClassTemplate.chap_index(chapter_list, filteredSubId);
      var chap_title = chapter_list[chapter_index].title;
      var title = `${chap_title} 교육자료 쓰기`;
      var list = ClassTemplate.list(topics, chapter_list,filteredId);
      var html = ClassTemplate.HTML(title, list,
       `
        <form action="/Study/${filteredId}/Chapter/${filteredSubId}/study_create_process" method="post">
          <input type="text" name="title" placeholder="ppt title" value="${chap_title}"><br><br>
          <textarea rows="10" cols="30" name="description" placeholder="description"></textarea><br>
          <p>
            <input type="submit" value="교육 자료 생성">
          </p>
        </form>
        `,
        `<p>${title}</p>`
      );
      response.send(html);
    });
    
  });
}); 

//교육자료 생성 처리 만들기~~~
router.post('/:pageId/Chapter/:chapterId/study_create_process', function(request, response){
  var filteredId = path.parse(request.params.pageId).base;
  var filteredSubId = path.parse(request.params.chapterId).base;
  var post = request.body;
  db.query(`UPDATE chapter SET description = ? WHERE class_id = ? and id = ?`
  , [post.description, filteredId, filteredSubId],
  function(error, result){
    if(error) throw error;
    response.redirect(`/Study/${filteredId}/Chapter/${filteredSubId}`);
  });
});

// 강의명 수정 부분 파트
router.get('/:pageId/class_update', function(request, response){
  var filteredId = path.parse(request.params.pageId).base; //pageId 값
  //console.log("fillteredId : " + filteredId);
  db.query(`SELECT * FROM class`, function(error, topics){
    if(error) throw error;
    db.query(`SELECT * FROM class WHERE id=?`, [filteredId], function(error2, topic){
      if(error2) throw error2;
      //console.log(topic);
      var title = topic[0].title;
      var list = ClassTemplate.list(topics);
      var html = ClassTemplate.HTML(title, list,
        `
        <form action="/Study/${filteredId}/class_update_process" method="post">
          <input type="hidden" name="id" value="${topic[0].id}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${topic[0].description}</textarea>
          </p>
          <p>
            <input type="submit" value="수정">
          </p>
        </form>
        `,
        `<p>강의 수정</p>`
      );
      response.send(html);
    });
  });
});

//강의명 수정 프로세스
router.post('/:pageId/class_update_process', function(request, response){
  var filteredId = path.parse(request.params.pageId).base; //pageId 값
  var post = request.body;
  db.query(`UPDATE class SET title = ?, description = ? WHERE id = ?`, 
    [post.title, post.description, filteredId], function(error, topics){
    if(error) throw error;
    response.redirect(`/Study/${filteredId}`);
  });
});

// 교육자료 수정 부분 파트
router.get('/:pageId/Chapter/:chapterId/study_update', function(request, response){
  var filteredId = path.parse(request.params.pageId).base;
  var filteredSubId = path.parse(request.params.chapterId).base;

  db.query(`SELECT * FROM class`, function(error, topics){ // topics는 리스트 값을 구현하기 위한 값들!
    if(error) throw error;
    db.query(`SELECT * FROM chapter WHERE class_id = ?`, [filteredId], function(error2, chapter_list){
      if(error2) throw error2;
      var chapter_index = ClassTemplate.chap_index(chapter_list, filteredSubId);
      //console.log(chapter_index);
      var title = chapter_list[chapter_index].title;
      var list = ClassTemplate.list(topics, chapter_list, filteredId);
      var html = ClassTemplate.HTML(title, list, 
        `
        <form action="/Study/${filteredId}/Chapter/${filteredSubId}/study_update_process" method="post">
          <input type="hidden" name="id" value="${filteredSubId}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${chapter_list[chapter_index].description}</textarea>
          </p>
          <p>
            <input type="submit" value="수정">
          </p>
        </form>
        `
        , '');
      response.send(html);
    });
  });
});

//교육자료 수정 프로세스 
router.post('/:pageId/Chapter/:chapterId/study_update_process', function(request, response){
  var filteredId = path.parse(request.params.pageId).base;
  var filteredSubId = path.parse(request.params.chapterId).base;
  var post = request.body;
  db.query(`UPDATE chapter SET title = ?, description = ? WHERE id = ? and class_id = ?`, 
    [post.title, post.description, filteredSubId, filteredId], function(error, topics){
    if(error) throw error;
    response.redirect(`/Study/${filteredId}/Chapter/${filteredSubId}`);
  }); 
});

// 강의 삭제 -> 강의를 삭제하려면 강의명도 삭제해야하고 강의 명의 챕터들도 삭제를 해야해요
router.post('/:pageId/class_delete_process', function(request, response){
  var post = request.body;
  db.query(`DELETE FROM chapter WHERE class_id=?`, [post.id], function(error1, result1){
    if(error1) throw error1;
    db.query(`DELETE FROM class WHERE id=?`, [post.id], function(error2, result2){
      if(error2) throw error2;
      response.redirect(`/Study`);
    });
  });
});

// chapter 삭제 프로세스
router.post('/:pageId/Chapter/:chapterId/chapter_delete_process', function(request, response){
  var post = request.body;
  db.query(`DELETE FROM chapter WHERE id=?`, [post.id], function(error, result){
    if(error) throw error;
    response.redirect(`/Study/${post.upperPage}`);
  });
});
   
  module.exports = router;