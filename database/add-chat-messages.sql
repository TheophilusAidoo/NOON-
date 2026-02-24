-- Chat messages for Seller <-> Admin real-time chat
-- Run in MySQL/phpMyAdmin. Use backticks to preserve column names (required for Prisma on MariaDB/XAMPP)

DROP TABLE IF EXISTS chat_messages;

CREATE TABLE chat_messages (
  `id` VARCHAR(191) NOT NULL,
  `senderId` VARCHAR(191) NOT NULL,
  `receiverId` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_sender` (`senderId`),
  INDEX `idx_receiver` (`receiverId`),
  INDEX `idx_sender_receiver` (`senderId`, `receiverId`),
  FOREIGN KEY (`senderId`) REFERENCES users(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiverId`) REFERENCES users(`id`) ON DELETE CASCADE
);
