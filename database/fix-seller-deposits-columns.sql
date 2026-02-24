-- Fix seller_deposits: Rename camelCase columns to snake_case for Prisma @map compatibility
-- Run this if you get "The column sellerId does not exist" (table may have been created with wrong names)

USE noonshop;

-- Rename sellerId -> seller_id (if sellerId exists)
SET @col = (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_deposits' AND COLUMN_NAME = 'sellerId' LIMIT 1);
SET @sql = IF(@col IS NOT NULL, 'ALTER TABLE seller_deposits CHANGE COLUMN sellerId seller_id VARCHAR(191) NOT NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename createdAt -> created_at (if createdAt exists)
SET @col = (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_deposits' AND COLUMN_NAME = 'createdAt' LIMIT 1);
SET @sql = IF(@col IS NOT NULL, 'ALTER TABLE seller_deposits CHANGE COLUMN createdAt created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Rename updatedAt -> updated_at (if updatedAt exists)
SET @col = (SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_deposits' AND COLUMN_NAME = 'updatedAt' LIMIT 1);
SET @sql = IF(@col IS NOT NULL, 'ALTER TABLE seller_deposits CHANGE COLUMN updatedAt updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
