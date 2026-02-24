-- NoonShop Database - Import via phpMyAdmin
-- 1. Create database 2. Select it 3. Import this file

SET FOREIGN_KEY_CHECKS=0;

CREATE DATABASE IF NOT EXISTS noonshop;
USE noonshop;

-- Drop tables if exist (for clean re-import)
DROP TABLE IF EXISTS site_settings;
DROP TABLE IF EXISTS withdrawal_requests;
DROP TABLE IF EXISTS banners;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS seller_profiles;
DROP TABLE IF EXISTS users;

-- Users
CREATE TABLE users (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password VARCHAR(191) NOT NULL,
  role ENUM('CUSTOMER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  isVerified BOOLEAN NOT NULL DEFAULT false,
  isApproved BOOLEAN NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_key (email)
);

-- Seller profiles
CREATE TABLE seller_profiles (
  id VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  storeName VARCHAR(191) NOT NULL,
  storeDescription TEXT NULL,
  logo VARCHAR(191) NULL,
  rating DOUBLE NOT NULL DEFAULT 0,
  totalSales INT NOT NULL DEFAULT 0,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY seller_profiles_userId_key (userId),
  CONSTRAINT seller_profiles_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE categories (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  slug VARCHAR(191) NOT NULL,
  image VARCHAR(191) NULL,
  promoLabel VARCHAR(191) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY categories_slug_key (slug)
);

-- Brands
CREATE TABLE brands (
  id VARCHAR(191) NOT NULL,
  name VARCHAR(191) NOT NULL,
  image VARCHAR(191) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
);

-- Products
CREATE TABLE products (
  id VARCHAR(191) NOT NULL,
  sellerId VARCHAR(191) NOT NULL,
  categoryId VARCHAR(191) NOT NULL,
  brandId VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE NOT NULL,
  discountPrice DOUBLE NULL,
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(191) NULL,
  isFeatured BOOLEAN NOT NULL DEFAULT false,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY products_sku_key (sku),
  KEY products_sellerId_idx (sellerId),
  KEY products_categoryId_idx (categoryId),
  KEY products_brandId_idx (brandId),
  KEY products_isFeatured_idx (isFeatured),
  CONSTRAINT products_sellerId_fkey FOREIGN KEY (sellerId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT products_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
  CONSTRAINT products_brandId_fkey FOREIGN KEY (brandId) REFERENCES brands(id) ON DELETE CASCADE
);

-- Product images
CREATE TABLE product_images (
  id VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  imageUrl VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  KEY product_images_productId_idx (productId),
  CONSTRAINT product_images_productId_fkey FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Product variants
CREATE TABLE product_variants (
  id VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  variantType VARCHAR(191) NOT NULL,
  variantValue VARCHAR(191) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY product_variants_productId_idx (productId),
  CONSTRAINT product_variants_productId_fkey FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Cart
CREATE TABLE cart (
  id VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY cart_userId_key (userId),
  CONSTRAINT cart_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Cart items
CREATE TABLE cart_items (
  id VARCHAR(191) NOT NULL,
  cartId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  variantId VARCHAR(191) NULL,
  PRIMARY KEY (id),
  KEY cart_items_cartId_idx (cartId),
  KEY cart_items_productId_idx (productId),
  CONSTRAINT cart_items_cartId_fkey FOREIGN KEY (cartId) REFERENCES cart(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_productId_fkey FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Wishlists
CREATE TABLE wishlists (
  id VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY wishlists_userId_productId_key (userId, productId),
  KEY wishlists_userId_idx (userId),
  CONSTRAINT wishlists_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT wishlists_productId_fkey FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
  id VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  totalAmount DOUBLE NOT NULL,
  paymentStatus ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
  orderStatus ENUM('PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PROCESSING',
  shippingAddress VARCHAR(191) NOT NULL,
  adminCommission DOUBLE NOT NULL DEFAULT 0,
  stripePaymentId VARCHAR(191) NULL,
  couponCode VARCHAR(191) NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY orders_userId_idx (userId),
  KEY orders_paymentStatus_idx (paymentStatus),
  KEY orders_orderStatus_idx (orderStatus),
  CONSTRAINT orders_userId_fkey FOREIGN KEY (userId) REFERENCES users(id)
);

-- Order items
CREATE TABLE order_items (
  id VARCHAR(191) NOT NULL,
  orderId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  sellerId VARCHAR(191) NOT NULL,
  quantity INT NOT NULL,
  price DOUBLE NOT NULL,
  PRIMARY KEY (id),
  KEY order_items_orderId_idx (orderId),
  KEY order_items_sellerId_idx (sellerId),
  CONSTRAINT order_items_orderId_fkey FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_productId_fkey FOREIGN KEY (productId) REFERENCES products(id),
  CONSTRAINT order_items_sellerId_fkey FOREIGN KEY (sellerId) REFERENCES users(id)
);

-- Reviews
CREATE TABLE reviews (
  id VARCHAR(191) NOT NULL,
  userId VARCHAR(191) NOT NULL,
  productId VARCHAR(191) NOT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY reviews_userId_productId_key (userId, productId),
  KEY reviews_productId_idx (productId),
  CONSTRAINT reviews_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT reviews_productId_fkey FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Coupons
CREATE TABLE coupons (
  id VARCHAR(191) NOT NULL,
  code VARCHAR(191) NOT NULL,
  discountType ENUM('PERCENTAGE', 'FIXED') NOT NULL,
  discountValue DOUBLE NOT NULL,
  expiryDate DATETIME(3) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  usageLimit INT NULL,
  usageCount INT NOT NULL DEFAULT 0,
  minOrderAmount DOUBLE NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY coupons_code_key (code)
);

-- Banners
CREATE TABLE banners (
  id VARCHAR(191) NOT NULL,
  title VARCHAR(191) NULL,
  imageUrl VARCHAR(191) NOT NULL,
  linkUrl VARCHAR(191) NULL,
  position INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id)
);

-- Site settings (currency, etc.)
CREATE TABLE site_settings (
  id VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_key (`key`)
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id VARCHAR(191) NOT NULL,
  sellerId VARCHAR(191) NOT NULL,
  amount DOUBLE NOT NULL,
  status VARCHAR(191) NOT NULL DEFAULT 'pending',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY withdrawal_requests_sellerId_idx (sellerId),
  CONSTRAINT withdrawal_requests_sellerId_fkey FOREIGN KEY (sellerId) REFERENCES users(id)
);

SET FOREIGN_KEY_CHECKS=1;

-- ==================== SEED DATA ====================

-- Admin user (password: Admin@123) - ON DUPLICATE KEY ensures correct role/password even if re-importing
INSERT INTO users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt)
VALUES ('cladmin001noonshop', 'Admin', 'admin@noonshop.com', '$2a$12$NGmVJJzMcuMJm3D2WXAk1eJd8UMlYhIEuzB8jK5qsOk8DZ1Sp9vwm', 'ADMIN', 1, NULL, NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE password = VALUES(password), role = 'ADMIN', isVerified = 1, updatedAt = NOW(3);

-- Categories
INSERT INTO categories (id, name, slug, image, promoLabel, createdAt) VALUES
('clcat001electronics', 'Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 'UP TO -30%', NOW(3)),
('clcat002fashion', 'Fashion', 'fashion', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400', 'UP TO -60%', NOW(3)),
('clcat003homegarden', 'Home & Garden', 'home-garden', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'UP TO -30%', NOW(3)),
('clcat004sports', 'Sports', 'sports', 'https://images.unsplash.com/photo-1461896836934-fff607db2abf?w=400', 'UP TO -30%', NOW(3)),
('clcat005beauty', 'Beauty', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'UP TO -60%', NOW(3)),
('clcat006books', 'Books', 'books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', 'UP TO -25%', NOW(3));

-- Brands
INSERT INTO brands (id, name, image, createdAt) VALUES
('clbrand001apple', 'Apple', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400', NOW(3)),
('clbrand002samsung', 'Samsung', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', NOW(3)),
('clbrand003nike', 'Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', NOW(3)),
('clbrand004adidas', 'Adidas', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', NOW(3)),
('clbrand005sony', 'Sony', 'https://images.unsplash.com/photo-1618442674654-739b7d2e1f97?w=400', NOW(3)),
('clbrand006lg', 'LG', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', NOW(3)),
('clbrand007philips', 'Philips', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', NOW(3)),
('clbrand008bosch', 'Bosch', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', NOW(3));

-- Seller user (password: Seller@123) - for sample products
INSERT INTO users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt) VALUES
('clseller001noonshop', 'Test Seller', 'seller@noonshop.com', '$2a$12$q0dgg1Z/ysN0esc4AQ3bYODmJvQMfpqPs.EhjbwqYubec4XHtR7.y', 'SELLER', 1, 1, NOW(3), NOW(3));

INSERT INTO seller_profiles (id, userId, storeName, storeDescription, rating, totalSales, createdAt, updatedAt) VALUES
('clsellerprof001', 'clseller001noonshop', 'Tech Paradise', 'Best electronics at best prices', 0, 0, NOW(3), NOW(3));

-- Sample products
INSERT INTO products (id, sellerId, categoryId, brandId, title, description, price, discountPrice, stock, sku, isFeatured, createdAt, updatedAt) VALUES
('clprod001headphones', 'clseller001noonshop', 'clcat001electronics', 'clbrand001apple', 'Wireless Bluetooth Headphones', 'Premium sound quality, 30hr battery', 99.99, 79.99, 50, 'WH-001', 1, NOW(3), NOW(3)),
('clprod002smartwatch', 'clseller001noonshop', 'clcat001electronics', 'clbrand001apple', 'Smart Watch Pro', 'Track fitness, receive notifications', 299.99, NULL, 30, 'SW-002', 1, NOW(3), NOW(3)),
('clprod003shoes', 'clseller001noonshop', 'clcat002fashion', 'clbrand003nike', 'Running Shoes Elite', 'Lightweight, breathable, perfect for marathon', 129.99, 99.99, 100, 'RS-003', 1, NOW(3), NOW(3));

INSERT INTO product_images (id, productId, imageUrl) VALUES
('climg001a', 'clprod001headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
('climg001b', 'clprod001headphones', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'),
('climg002a', 'clprod002smartwatch', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
('climg003a', 'clprod003shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500');

-- Banners
INSERT INTO banners (id, title, imageUrl, linkUrl, position, active, createdAt, updatedAt) VALUES
('clbanner001', 'Summer Sale', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', '/products?category=electronics', 0, 1, NOW(3), NOW(3)),
('clbanner002', 'New Arrivals', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200', '/products', 1, 1, NOW(3), NOW(3)),
('clbanner003', 'Flash Deals', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200', '/products?flash=true', 2, 1, NOW(3), NOW(3));

-- Site settings (currency)
INSERT INTO site_settings (id, `key`, `value`) VALUES ('clsetting001', 'currency', '{"code":"USD","symbol":"$"}')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
