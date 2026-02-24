-- NoonShop - Seed data only (run this if tables exist but are empty)
-- Use in phpMyAdmin: select noonshop database, then run this file

USE noonshop;

-- Admin (password: Admin@123)
INSERT IGNORE INTO users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt)
VALUES ('cladmin001noonshop', 'Admin', 'admin@noonshop.com', '$2a$12$NGmVJJzMcuMJm3D2WXAk1eJd8UMlYhIEuzB8jK5qsOk8DZ1Sp9vwm', 'ADMIN', 1, NULL, NOW(3), NOW(3));

-- Categories (only if empty)
INSERT IGNORE INTO categories (id, name, slug, image, promoLabel, createdAt) VALUES
('clcat001electronics', 'Electronics', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', 'UP TO -30%', NOW(3)),
('clcat002fashion', 'Fashion', 'fashion', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400', 'UP TO -60%', NOW(3)),
('clcat003homegarden', 'Home & Garden', 'home-garden', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', 'UP TO -30%', NOW(3)),
('clcat004sports', 'Sports', 'sports', 'https://images.unsplash.com/photo-1461896836934-fff607db2abf?w=400', 'UP TO -30%', NOW(3)),
('clcat005beauty', 'Beauty', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', 'UP TO -60%', NOW(3)),
('clcat006books', 'Books', 'books', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400', 'UP TO -25%', NOW(3));

-- Brands (only if empty)
INSERT IGNORE INTO brands (id, name, image, createdAt) VALUES
('clbrand001apple', 'Apple', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400', NOW(3)),
('clbrand002samsung', 'Samsung', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400', NOW(3)),
('clbrand003nike', 'Nike', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', NOW(3)),
('clbrand004adidas', 'Adidas', 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400', NOW(3)),
('clbrand005sony', 'Sony', 'https://images.unsplash.com/photo-1618442674654-739b7d2e1f97?w=400', NOW(3)),
('clbrand006lg', 'LG', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', NOW(3)),
('clbrand007philips', 'Philips', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', NOW(3)),
('clbrand008bosch', 'Bosch', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400', NOW(3));

-- Seller (password: Seller@123)
INSERT IGNORE INTO users (id, name, email, password, role, isVerified, isApproved, createdAt, updatedAt) VALUES
('clseller001noonshop', 'Test Seller', 'seller@noonshop.com', '$2a$12$q0dgg1Z/ysN0esc4AQ3bYODmJvQMfpqPs.EhjbwqYubec4XHtR7.y', 'SELLER', 1, 1, NOW(3), NOW(3));

INSERT IGNORE INTO seller_profiles (id, userId, storeName, storeDescription, rating, totalSales, createdAt, updatedAt) VALUES
('clsellerprof001', 'clseller001noonshop', 'Tech Paradise', 'Best electronics at best prices', 0, 0, NOW(3), NOW(3));

-- Products (only if empty)
INSERT IGNORE INTO products (id, sellerId, categoryId, brandId, title, description, price, discountPrice, stock, sku, isFeatured, createdAt, updatedAt) VALUES
('clprod001headphones', 'clseller001noonshop', 'clcat001electronics', 'clbrand001apple', 'Wireless Bluetooth Headphones', 'Premium sound quality, 30hr battery', 99.99, 79.99, 50, 'WH-001', 1, NOW(3), NOW(3)),
('clprod002smartwatch', 'clseller001noonshop', 'clcat001electronics', 'clbrand001apple', 'Smart Watch Pro', 'Track fitness, receive notifications', 299.99, NULL, 30, 'SW-002', 1, NOW(3), NOW(3)),
('clprod003shoes', 'clseller001noonshop', 'clcat002fashion', 'clbrand003nike', 'Running Shoes Elite', 'Lightweight, breathable, perfect for marathon', 129.99, 99.99, 100, 'RS-003', 1, NOW(3), NOW(3));

INSERT IGNORE INTO product_images (id, productId, imageUrl) VALUES
('climg001a', 'clprod001headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'),
('climg001b', 'clprod001headphones', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'),
('climg002a', 'clprod002smartwatch', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'),
('climg003a', 'clprod003shoes', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500');

-- Banners (only if empty)
INSERT IGNORE INTO banners (id, title, imageUrl, linkUrl, position, active, createdAt, updatedAt) VALUES
('clbanner001', 'Summer Sale', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', '/products?category=electronics', 0, 1, NOW(3), NOW(3)),
('clbanner002', 'New Arrivals', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200', '/products', 1, 1, NOW(3), NOW(3)),
('clbanner003', 'Flash Deals', 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200', '/products?flash=true', 2, 1, NOW(3), NOW(3));

-- Site settings (currency) - create table if missing
CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `value` VARCHAR(191) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY site_settings_key_key (`key`)
);
INSERT IGNORE INTO site_settings (id, `key`, `value`) VALUES ('clsetting001', 'currency', '{"code":"USD","symbol":"$"}');
