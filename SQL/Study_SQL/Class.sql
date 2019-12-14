CREATE TABLE `Class` (
    `cid` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `created` DATETIME NOT NULL,
    `chapterNum` TINYINT(30) NULL,
    `author` VARCHAR(30) NULL,
    PRIMARY KEY(`id`)
)default charset = utf8;