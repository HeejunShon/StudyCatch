CREATE TABLE `Task_Board` (
    `id` INT(5) AUTO_INCREMENT,
    `title` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `upload_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `author` INT(11) NOT NULL,
    `cid` INT(11) NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`cid`) REFERENCES `Chapter`(`id`)
)default charset = utf8;
/*cid -> chapterId*/