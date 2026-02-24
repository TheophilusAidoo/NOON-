-- Add image_url column for chat image sharing
-- Run: mysql -u root noonshop < database/add-chat-image-url.sql

USE noonshop;

-- Add image_url if not exists
SET @col = (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'chat_messages' AND COLUMN_NAME = 'image_url' LIMIT 1);
SET @sql = IF(@col IS NULL, 'ALTER TABLE chat_messages ADD COLUMN image_url VARCHAR(500) NULL AFTER content', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
