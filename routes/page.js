var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var template = require('../lib/page/template.js');
var url = require('url');

router.get('/', (request, response) => {
    console.log('리퀘스트'+request);
    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      `,
      `<a href="/page/create">create</a>`
    );
  
    response.send(html);
    }
  );

//글 생성
router.get('/create', (request, response) =>{
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
        <form action="/page/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `, '');
        response.send(html);
    }
);

/* 
    pageId == 상위페이지 (과제)
    subPageId == 하위페이지 (과제 제출)
*/

//서브 글 생성
router.get('/create/:pageId', (request, response) =>{
    var filteredId = path.parse(request.params.pageId).base;
    console.log('create : ' + filteredId);
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        //과제 제출 폴더 생성용 현재 페이지 이름(id)) sup page로 전송
        var id = request.params.pageId;
        console.log('id : ' + id);
        var list = template.list(request.list);
        var html = template.HTML(id, list,
        `
        <form action="/page/create_process" method="post">
        <input type="hidden" name="id" value="${id}">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
        </form>
        `, '');
        response.send(html);
    });
}   
);

//글 생성 처리 + 서브페이지
router.post('/create_process', (request, response) => {
    //body-parser
    var post = request.body;
    //id = 상위 페이지 이름
    var id = post.id;
    var page = post.page;
    console.log('id : ' + id);
    var title = post.title;
    var description = post.description;

    //상위페이지(id)가 없으면(과제 제출시) data 폴더에 과제 생성
    if(id === undefined){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.redirect(`/page/${title}`);
        });
    }else {
        //상위페이지 존재시 과제 제출 폴더(data_sub) 생성
        if(!fs.existsSync(`data_sub/${id}`)){
            fs.mkdirSync(`data_sub/${id}`);
        }
        //과제 제출 폴더(data_sub)에 과제 제출
        fs.writeFile(`data_sub/${id}/${title}`, description, 'utf8', function(err){
            response.redirect(`/`);
        });
    }
    }
);

//글 수정
router.get('/update/:pageId', (request, response) =>{
    var filteredId = path.parse(request.params.pageId).base;
    console.log('업뎃 : '+request.url);

    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        var title = request.params.pageId;
        var list = template.list(request.list);
        var html = template.HTML(title, list,
        `
        <form action="/page/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
            <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
            <input type="submit">
            </p>
        </form>
        `,
        `<a href="/page/create">create</a> <a href="/page/update/${title}">update</a>`
        );
        response.send(html);
    });
}
);

//서브페이지 수정
router.get('/update/:pageId/:subPageId', (request, response) =>{
    //filteredId = 상위폴더(과제)
    //filteredSubId = 하위파일(과제제출)
    var filteredId = path.parse(request.params.pageId).base;
    var filteredSubId = path.parse(request.params.subPageId).base;

    console.log('업뎃 : '+filteredSubId);
    //과제 폴더에 과제 수정
    fs.readFile(`data_sub/${filteredId}/${filteredSubId}`, 'utf8', function(err, description){
        var title = filteredSubId;
        var sublist = '';
        if(fs.existsSync(`data_sub/${filteredId}`)){
            sublist = fs.readdirSync(`data_sub/${filteredId}`);
        }
        var list = template.list(request.list, sublist, filteredId);

        var html = template.HTML(title, list,
        `
        <form action="/page/${filteredId}/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
            <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
            <input type="submit">
            </p>
        </form>
        `,
        `<a href="/page/create">create</a> <a href="/page/update/${title}">update</a>`
        );
        response.send(html);
    });
}
);

//글 수정 처리
router.post('/update_process', (request, response) => {
    console.log('기본업데이트');
    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect(`/page/${title}`);
        })
    });
    }
);

//서브페이지 글 수정처리
router.post('/:pageId/update_process', (request, response) => {
    //filteredId == 상위페이지
    var filteredId = path.parse(request.params.pageId).base;
    console.log('수정처리 id : ' + filteredId);

    var post = request.body;
    var id = post.id;
    var title = post.title;
    var description = post.description;
    //id == 이전페이지 이름, title == 수정할페이지 이름
    fs.rename(`data_sub/${filteredId}/${id}`, `data_sub/${filteredId}/${title}`, function(error){
        fs.writeFile(`data_sub/${filteredId}/${title}`, description, 'utf8', function(err){
        response.redirect(`/page/${filteredId}/${title}`);
        })
    });
    }
);

//글 삭제
router.post('/delete_process', (request, response) => {
    var post = request.body;
    var upperPage = post.upperPage;
    var id = post.id;
    var filteredId = path.parse(id).base;
    console.log("id : "+ id);
    console.log("upper : " + upperPage);
    console.log("ftdid : " + filteredId);

    //상위페이지 삭제
    if(upperPage === undefined){        
        fs.unlink(`data/${filteredId}`, function(error){
            console.log('1');
            //서브페이지 존재시 
            if(fs.existsSync(`data_sub/${filteredId}`)){
                console.log('2');
                //서브페이지도 삭제 (삭제 거부되는 버그 있음 :operation not permitted, errno: -4048)
                fs.unlink(`data_sub/${filteredId}`, function(error){
                    console.log('3');
                    console.log(error);
                });
            }
            response.redirect('/');
        });
        //서브페이지 삭제
    }else {
        fs.unlink(`data_sub/${upperPage}/${filteredId}`, function(error){
            response.redirect('/');
        });
    }
    }
);


//페이지
router.get('/:pageId', (request, response, next) =>{
    var filteredId = path.parse(request.params.pageId).base;
    //console.log("페이지filteer : " + filteredId);
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        if(err){
        next(err);
        } else{
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
            allowedTags:['h1']
        });
      //  console.log('request list : '+ request.list);
       // console.log('필터 id : '+ filteredId);

        var sublist = '';
        if(fs.existsSync(`data_sub/${filteredId}`)){
            sublist = fs.readdirSync(`data_sub/${filteredId}`);
        }
        var list = template.list(request.list, sublist, filteredId);
        
        var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/page/create/${sanitizedTitle}">create</a>
            <a href="/page/update/${sanitizedTitle}">update</a>
            <form action="/page/delete_process" method="post">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
            </form>`
        );

        response.send(html);
        }
    }
    );
}
);

//서브페이지
router.get('/:pageId/:subPageId', (request, response, next) =>{
    //filteredId = 상위폴더(과제)
    //filteredSubId = 하위파일(과제제출)
    var filteredId = path.parse(request.params.pageId).base;
    var filteredSubId = path.parse(request.params.subPageId).base;

    // console.log("페이지id : " + filteredId);
    // console.log("req param : " + filteredSubId);

    fs.readFile(`data_sub/${filteredId}/${filteredSubId}`, 'utf8', function(err, description){
        if(err){
        next(err);
        } else{
        var upperPage = filteredId;
        console.log('상위페이지 : ' +upperPage);
        var title = filteredSubId;
        var sanitizedUpperPage = sanitizeHtml(upperPage);
        console.log('sanitized상위 : ' + sanitizedUpperPage);
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
            allowedTags:['h1']
        });

    //console.log('request list : '+ request.list);
    //console.log('필터 id : '+ filteredId);

        //과제 제출된 페이지들(sublist)) 읽어오기
        var sublist = '';
        if(fs.existsSync(`data_sub/${filteredId}`)){
            sublist = fs.readdirSync(`data_sub/${filteredId}`);
        }

        //sublist 템플릿list에 전송, 과제 아래에 리스트 붙이기
        var list = template.list(request.list, sublist, filteredId);
        
        var html = template.HTML(sanitizedTitle, list,
            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
            ` <a href="/page/create/${sanitizedTitle}">create</a>
            <a href="/page/update/${sanitizedUpperPage}/${sanitizedTitle}">update</a>
            <form action="/page/delete_process" method="post">
                <input type="hidden" name="upperPage" value="${sanitizedUpperPage}">
                <input type="hidden" name="id" value="${sanitizedTitle}">
                <input type="submit" value="delete">
            </form>`
        );

        response.send(html);
        }
    }
    );
}
);


module.exports = router;