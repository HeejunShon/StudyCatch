module.exports = {
    HTML:function(title, list, body, control){
      return `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">Study Catch</a></h1>
        ${list}
        ${control}
        ${body}
      </body>
      </html>
      `; 
    },list:function(filelist, sublist='', file=''){ //sublist, file 추가 매개변수 기본='' 
      
      //console.log(filelist);
      //console.log(sublist);
  
      var list = '<ul>';
      var i = 0;
      while(i < filelist.length){
        list = list + `<li><a href="/page/${filelist[i]}">${filelist[i]}</a></li>`;
        //과제 아래에 과제제출 리스트 붙이기
        if(filelist[i] === file){
          list = list + `<ul>`;
          var j = 0;
          while(j < sublist.length){
            list = list + `<li><a href="/page/${filelist[i]}/${sublist[j]}">${sublist[j]}</a></li>`;
            j = j + 1;        
          }
          list = list + `</ul>`;
        }
        i = i + 1;
      }
      list = list+'</ul>';
      return list;
    }
  }
  