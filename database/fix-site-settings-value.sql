-- Fix: value column too small for seller_levels JSON (VARCHAR 191 truncates)
-- Run in phpMyAdmin (select noonshop database)
USE noonshop;

ALTER TABLE site_settings MODIFY COLUMN `value` TEXT NOT NULL;
