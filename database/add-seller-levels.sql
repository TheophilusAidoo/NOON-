-- Store levels: add columns to seller_profiles, create seller_deposits table
USE noonshop;

-- Add store_level only if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'store_level');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE seller_profiles ADD COLUMN store_level VARCHAR(10) NOT NULL DEFAULT ''C''', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add cumulative_recharge only if it doesn't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_profiles' AND COLUMN_NAME = 'cumulative_recharge');
SET @sql = IF(@col_exists = 0, 'ALTER TABLE seller_profiles ADD COLUMN cumulative_recharge DOUBLE NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create seller_deposits table (if not exists)
CREATE TABLE IF NOT EXISTS seller_deposits (
  id VARCHAR(191) NOT NULL,
  seller_id VARCHAR(191) NOT NULL,
  amount DOUBLE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  INDEX seller_deposits_seller_id_idx (seller_id)
);

-- Seed default seller levels config (admin can change)
INSERT IGNORE INTO site_settings (id, `key`, `value`) VALUES
  ('clsellerlevels', 'seller_levels', '{"C":{"rechargeRequired":1000,"productLimit":20,"profitMargin":15},"B":{"rechargeRequired":10000,"productLimit":50,"profitMargin":20},"A":{"rechargeRequired":50000,"productLimit":100,"profitMargin":25},"S":{"rechargeRequired":100000,"productLimit":200,"profitMargin":30}}');
