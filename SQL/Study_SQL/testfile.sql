CREATE TABLE `TestFile` (
    `fid` INT(11) NOT NULL AUTO_INCREMENT,
    `chapId` INT(11) NULL,
    `classId` INT(11) NULL,
    `filename` VARCHAR(100) NOT NULL,
    `filepath` TEXT NULL,
    PRIMARY KEY(`fid`),
    FOREIGN KEY(`classId`) REFERENCES `Class`(`cid`),
    FOREIGN KEY(`chapId`) REFERENCES `Chapter`(`id`)
)default charset = utf8;