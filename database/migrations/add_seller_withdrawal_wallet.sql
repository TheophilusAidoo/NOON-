-- Seller withdrawal: wallet address and crypto name (required before withdrawal)
-- Run: mysql -u root noonshop < database/migrations/add_seller_withdrawal_wallet.sql

ALTER TABLE seller_profiles ADD COLUMN crypto_wallet_address VARCHAR(255) NULL;
ALTER TABLE seller_profiles ADD COLUMN crypto_name VARCHAR(64) NULL;

ALTER TABLE withdrawal_requests ADD COLUMN wallet_address VARCHAR(255) NULL;
ALTER TABLE withdrawal_requests ADD COLUMN crypto_name VARCHAR(64) NULL;
