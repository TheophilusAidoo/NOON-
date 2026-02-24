-- Seller wholesale fulfillment: seller must pay admin before admin can ship
-- Run: mysql -u root noonshop < database/migrations/add_seller_wholesale_fulfillment.sql
-- If column exists errors occur, run each ALTER separately and skip ones that already ran.

ALTER TABLE seller_profiles ADD COLUMN wholesale_spend DOUBLE NOT NULL DEFAULT 0;

ALTER TABLE order_items ADD COLUMN wholesale_cost DOUBLE NULL;
ALTER TABLE order_items ADD COLUMN seller_paid_to_admin TINYINT(1) NOT NULL DEFAULT 0;
