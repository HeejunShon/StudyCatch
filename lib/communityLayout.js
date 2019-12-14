var db = require('../lib/database.js');
var fs = require('fs');
var ejs = require('ejs');

var mysql = require('mysql');

var communityTemplateEjs = fs.readFileSync('lib/ejs/communityTemplate.ejs', 'utf8');
var bannerEjs = fs.readFileSync('lib/ejs/banner.ejs', 'utf-8');

module.exports = {
    HTML:function(user, communityID, ContentEjs, response){

        var userName = " ";
        //로그인되어있을 시 닉네임 전달
        if(user){
            userName = user.displayName;
        }
    
        //다중쿼리 (배너용 커뮤니티sql + 교육 목록sql)
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
            
                console.log(result[1] +" .");

                
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
                        ${ContentEjs}
                    </div>
                    `
                });

                response.send(home);
            }
        });
    }
}