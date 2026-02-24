-- Add site_settings table (run in phpMyAdmin if Prisma db push fails)
USE noonshop;

CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` TEXT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_key (`key`)
);

INSERT IGNORE INTO site_settings (id, `key`, `value`) VALUES ('clsetting001', 'currency', '{"code":"USD","symbol":"$"}');
