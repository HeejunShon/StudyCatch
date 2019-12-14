CREATE TABLE `QnA_Board` (
  `id` int(5) AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `qcontent` text NOT NULL,
  `answer` text DEFAULT NULL,
  `qusid` varchar(20) NOT NULL,
  `ansid` varchar(20) DEFAULT NULL,
  `qusdate` varchar(20) NOT NULL,
  `ansdate` varchar(20) DEFAULT NULL,
  `status` int(1) DEFAULT 0,
  PRIMARY KEY (`id`)
)default charset = utf8;

//QnA_Board 테이블 커뮤니티 ID 열 추가
ALTER TABLE QnA_Board
ADD communityID INT not null;

ALTER TABLE QnA_Board
ADD CONSTRAINT fk_qna_comu_id
FOREIGN KEY (communityID) REFERENCES communities (id) ON DELETE CASCADE;

CREATE TABLE `free_Board` (
  `id` int(5) AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `content` text NOT NULL,
  `writerId` varchar(20) NOT NULL,
  `date` varchar(20) DEFAULT NULL,
  `hit` int(5) DEFAULT 0,
  `communityID` int NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`communityID`) REFERENCES `communities`(`id`)
)default charset = utf8;