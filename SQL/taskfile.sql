CREATE TABLE `TaskFile`(
    `tid` INT(11) NOT NULL AUTO_INCREMENT,
    `chapId` INT(11) NULL,
    `classId` INT(11) NULL,
    `filename` VARCHAR(100) NOT NULL,
    `filepath` TEXT NULL,
    `author` INT(11) NULL,
    PRIMARY KEY(`tid`),
    FOREIGN KEY(`classId`) REFERENCES `Class`(`cid`),
    FOREIGN KEY(`chapId`) REFERENCES `Chapter`(`id`),
    FOREIGN KEY(`author`) REFERENCES `Users`(`id`)
)default charset = utf8;

ALTER TABLE taskfile 
ADD author INT(11) NULL;

ALTER TABLE taskfile 
ADD CONSTRAINT FK_author_userId 
FOREIGN KEY (`author`) 
REFERENCES `Users`(`id`);