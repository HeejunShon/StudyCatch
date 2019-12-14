CREATE TABLE `Chapter` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NULL,
    `class_id` INT(11) NOT NULL,
    `description` TEXT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`class_id`) REFERENCES `Class`(`cid`)
)default charset = utf8;