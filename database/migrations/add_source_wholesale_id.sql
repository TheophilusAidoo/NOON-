-- Add source_wholesale_id column to products table
-- Run this manually if prisma migrate fails (e.g. MariaDB version mismatch)
-- Usage: mysql -u root noonshop < database/migrations/add_source_wholesale_id.sql

ALTER TABLE products ADD COLUMN source_wholesale_id VARCHAR(191) NULL;
