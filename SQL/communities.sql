CREATE TABLE communities ( 
    id INT NOT NULL AUTO_INCREMENT , 
    communityName VARCHAR(30) NOT NULL, 
    introduction VARCHAR(50),
    category VARCHAR(20) NOT NULL,
    masterEmail VARCHAR(50) NOT NULL ,
    masterId int(11) NOT NULL,
    PRIMARY KEY (id, communityName),
    FOREIGN KEY (masterId, masterEmail)
    REFERENCES users(id, email) ON UPDATE CASCADE
)default charset = utf8;

//users 테이블에 기본키 id, email로 바뀐거 적용해주시고
//communities 테이블 생성시 오류나면 FOREIGN key~ REFERENCES 부분 삭제하고 생성해주세요

//register 테이블 (커뮤니티 가입된 유저 정보)
CREATE TABLE register (
    communityID INT NOT NULL, 
    userID INT NOT NULL,
    PRIMARY KEY (communityID, userID)
)default charset = utf8;

ALTER TABLE register
ADD CONSTRAINT fk_commu_id
FOREIGN KEY (communityID) REFERENCES communities (id) ON DELETE CASCADE;

ALTER TABLE register
ADD CONSTRAINT fk_user_id
FOREIGN KEY (userID) REFERENCES users (id) ON DELETE CASCADE;

//class 테이블 커뮤니티 ID 열 추가
ALTER TABLE class
ADD communityID INT not null;

//author 컬럼 수정, users테이블 id와 기본키 외래키
ALTER TABLE class
MODIFY author int not null;

ALTER TABLE class
ADD CONSTRAINT fk_class_user_id
FOREIGN KEY (author) REFERENCES users (id) ON DELETE CASCADE;

//class 테이블 id -> cid로 이름 변경
ALTER TABLE class
CHANGE id cid int AUTO_INCREMENT;