CREATE TABLE users ( 
    id INT NOT NULL AUTO_INCREMENT , 
    authId VARCHAR(50) NOT NULL ,
    username VARCHAR(30), 
    password VARCHAR(255), 
    salt VARCHAR(255),
    displayName VARCHAR(50),
    approved VARCHAR(20) NOT NULL,
    email VARCHAR(50) NOT NULL , 
    PRIMARY KEY (id, email),
    UNIQUE (authId)
)default charset = utf8;

//approved  student: 학생
            teacher: 강사
            manager: 관리자

CREATE TABLE sessions(
    session_id varchar(128),
    expires int(11) DEFAULT NULL,
    data text,
    PRIMARY KEY (session_id)
);