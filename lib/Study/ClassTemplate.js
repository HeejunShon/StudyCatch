module.exports = {
    HTML:function(title, list, body, control){
      return `
      <!doctype html>
      <html>
      <head>
        <title>Study Catch - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/Study">교육게시판</a></h1>
        ${list}
        ${control}
        ${body}
      </body>
      </html>
      `;
    },list:function(topics , lecture = '', lecture_id = ''){
      var list = '<ul>';
      var i = 0;
      while(i < topics.length){
        list = list + `<li><a href="/Study/${topics[i].id}">${topics[i].title}</a></li>`;
        // 챕터 리스트 붙이기
        if(topics[i].id == lecture_id){ // 왜 == 두개를 써야하는지는 모르겠어여...!
          list = list + `<ul>`;
          var j = 0;
          while(j < lecture.length){
            //console.log(j + "번째" +"lecture : " + lecture[j].id);
            list = list + `<li><a href="/Study/${topics[i].id}/Chapter/${lecture[j].id}">${lecture[j].title}</a></li>`//lecture[j].id 로 바꿀 것!
            j = j + 1;
          }
          list = list + `</ul>`;
        }
        i = i + 1;
      }
      list = list+'</ul>';
      return list;
    }, body:function(title, exist_chapter){
        var _body = `<p>`;
        var chapter_num = exist_chapter;// 챕터 없으면 0!
        if(chapter_num == null){
            _body += `<p>${title} 챕터 생성을 해주세요!</p>`;
        }
        else{
            _body += `<p>${title}을 공부하러 오셨군요. 열심히 공부하시길 바랍니다.</p>`;
        }
        _body += `</p>`
        return _body;
    }// 강의 버튼을 눌렀을 때 챕터가 있을 시와 없을 시 템플릿 구분 챕터의 유무는 데이터베이스로 판단할 예정!
    , chapter: function(chapter_num){
      var chapter = '<p>';
      var i = 0;
      while(i < chapter_num){
        chapter += `<input type="text" name="chapter_${i+1}" placeholder="챕터${i+1} 이름 입력">`;
        i++;
      }
      chapter += '</p>';
      return chapter;
    }, // 챕터 입력 창 생성하는 부분
    chap_index: function(chapter_list, filteredSubId){ // chapter id 값이랑 비교해서 같은거 찾아서 title 값 넘겨주는 거
      var i = 0;
      while(i < chapter_list.length){
        //console.log(i);
        if(chapter_list[i].id == filteredSubId){
          return i;
        }
        i++;
      }
      //return chapter_list[i].title;
    }
    /*image: function(){
      var image = `<p>`;
      image += `<img src="uploads/taeyeon.jpg" alt="image1" width="100">`;
      image += `</p>`;
      return image;
    }*/
  }
  