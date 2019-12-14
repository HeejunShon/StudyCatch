CREATE TABLE `subtask_board`(
    `id` INT(5) AUTO_INCREMENT,
    `title` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `upload_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `author` INT(11) NOT NULL,
    `task_id` INT(11) NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`task_id`) REFERENCES `task_board`(`id`)
)default charset = utf8;