-- Add credit_score to seller_profiles (0-1000, default 100)
-- Prisma maps creditScore field -> credit_score column
USE noonshop;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'credit_score');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE seller_profiles ADD COLUMN credit_score INT NOT NULL DEFAULT 100', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
