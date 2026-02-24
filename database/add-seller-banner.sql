-- Add banner column to seller_profiles
USE noonshop;

SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'banner');
SET @sql = IF(@col = 0, 'ALTER TABLE seller_profiles ADD COLUMN banner VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
