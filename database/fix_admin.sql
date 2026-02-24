-- Run this in phpMyAdmin if you get "Access denied"
-- Select the noonshop database, then run this SQL

USE noonshop;

-- Fix admin user: ensure role is ADMIN and password is Admin@123
-- This updates existing user or inserts if not exists
INSERT INTO users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt)
VALUES (
  'cladmin001noonshop',
  'Admin',
  'admin@noonshop.com',
  '$2a$12$NGmVJJzMcuMJm3D2WXAk1eJd8UMlYhIEuzB8jK5qsOk8DZ1Sp9vwm',
  'ADMIN',
  1,
  NULL,
  NOW(3),
  NOW(3)
)
ON DUPLICATE KEY UPDATE
  password = VALUES(password),
  role = 'ADMIN',
  isVerified = 1,
  updatedAt = NOW(3);
