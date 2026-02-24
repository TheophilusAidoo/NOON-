-- Fix seller_profiles: ensure store_level, cumulative_recharge, credit_score exist
-- Run this if you get "storeLevel does not exist" or similar Prisma errors
USE noonshop;

-- 1. store_level (add if missing - add-seller-levels may have added store_level)
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'store_level');
SET @sql = IF(@col = 0, 'ALTER TABLE seller_profiles ADD COLUMN store_level VARCHAR(10) NOT NULL DEFAULT ''C''', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. cumulative_recharge
SET @col = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'cumulative_recharge');
SET @sql = IF(@col = 0, 'ALTER TABLE seller_profiles ADD COLUMN cumulative_recharge DOUBLE NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. credit_score: add new column, migrate from creditScore if exists, drop old
SET @has_new = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'credit_score');
SET @has_old = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'creditScore');

-- Add credit_score if missing
SET @sql = IF(@has_new = 0, 'ALTER TABLE seller_profiles ADD COLUMN credit_score INT NOT NULL DEFAULT 100', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Migrate from creditScore -> credit_score
SET @sql = IF(@has_old > 0, 'UPDATE seller_profiles SET credit_score = `creditScore`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Drop old creditScore column
SET @sql = IF(@has_old > 0, 'ALTER TABLE seller_profiles DROP COLUMN `creditScore`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
