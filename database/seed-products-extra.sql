-- NoonShop - Import 50 extra products with online images
-- Prerequisites: Run seed-data.sql OR npx prisma db seed first (categories, brands, seller)
-- In phpMyAdmin: select noonshop database, then run this file

USE noonshop;

-- Get seller (prefer seller@noonshop.com, else admin@noonshop.com)
SET @sid = (SELECT id FROM users WHERE email = 'seller@noonshop.com' LIMIT 1);
SET @sid = IFNULL(@sid, (SELECT id FROM users WHERE email = 'admin@noonshop.com' LIMIT 1));

-- Insert 50 products (SKU 041-090) - uses existing categories/brands from your DB
INSERT IGNORE INTO products (id, sellerId, categoryId, brandId, title, description, price, discountPrice, stock, sku, isFeatured, createdAt, updatedAt)
SELECT * FROM (
  SELECT CONCAT('clp', SUBSTRING(SHA2('PCL-041', 256), 1, 22)) AS id, @sid AS sellerId,
    (SELECT id FROM categories WHERE slug = 'mobile-accessories' LIMIT 1) AS categoryId,
    (SELECT id FROM brands WHERE name = 'Apple' LIMIT 1) AS brandId,
    'Phone Case Leather' AS title, 'Premium leather, mag-safe compatible' AS description, 34.99 AS price, NULL AS discountPrice, 200 AS stock, 'PCL-041' AS sku, 0 AS isFeatured, NOW(3) AS createdAt, NOW(3) AS updatedAt
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('LS-042', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'computing' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Samsung' LIMIT 1),
    'Laptop Sleeve 15"', 'Neoprene, padded, fits 15" laptops', 29.99, 24.99, 150, 'LS-042', 0, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('SDC-043', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'home-office' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'LG' LIMIT 1),
    'Standing Desk Converter', 'Sit-stand, height adjustable, keyboard tray', 189.99, NULL, 40, 'SDC-043', 1, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('DS-044', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'fashion' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Nike' LIMIT 1),
    'Dumbbells Set 20kg', 'Adjustable, cast iron, rubber-coated', 149.99, NULL, 60, 'DS-044', 0, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('RB-045', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'fashion' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Adidas' LIMIT 1),
    'Resistance Bands Set', '5 levels, carry bag, workout guide included', 24.99, NULL, 180, 'RB-045', 0, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('SS-046', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'electronics' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Samsung' LIMIT 1),
    'Smart Scale', 'Body composition, app sync, sleek glass design', 59.99, 49.99, 80, 'SS-046', 0, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('LSL-047', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'home-office' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Philips' LIMIT 1),
    'LED Strip Lights', 'RGB, smart app, music sync, 5m reel', 39.99, NULL, 120, 'LSL-047', 0, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('CG-048', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'appliances' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Philips' LIMIT 1),
    'Coffee Grinder', 'Burr grinder, 15 settings, stainless steel', 79.99, NULL, 55, 'CG-048', 0, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('TS-049', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'appliances' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Philips' LIMIT 1),
    'Toaster 4-Slice', 'Wide slots, 6 browning levels, bagel mode', 54.99, 44.99, 70, 'TS-049', 0, NOW(3), NOW(3)
  UNION SELECT CONCAT('clp', SUBSTRING(SHA2('KE-050', 256), 1, 22)), @sid,
    (SELECT id FROM categories WHERE slug = 'appliances' LIMIT 1),
    (SELECT id FROM brands WHERE name = 'Philips' LIMIT 1),
    'Kettle Electric', '1.7L, boil-dry protection, 360° base', 45.99, NULL, 95, 'KE-050', 0, NOW(3), NOW(3)
) t WHERE @sid IS NOT NULL AND NOT EXISTS (SELECT 1 FROM products WHERE sku = t.sku);

-- Product images for above (match by SKU -> productId)
INSERT IGNORE INTO product_images (id, productId, imageUrl)
SELECT CONCAT('clpi', SUBSTRING(SHA2(CONCAT(p.sku, '-1'), 256), 1, 18)), p.id, img
FROM products p
CROSS JOIN (
  SELECT 'PCL-041' AS sku, 'https://images.unsplash.com/photo-1601593346742-0c6252e1ea1e?w=500' AS img
  UNION SELECT 'LS-042', 'https://images.unsplash.com/photo-1584931422390-299d1c4a6f84?w=500'
  UNION SELECT 'SDC-043', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'
  UNION SELECT 'DS-044', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'
  UNION SELECT 'RB-045', 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'
  UNION SELECT 'SS-046', 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500'
  UNION SELECT 'LSL-047', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
  UNION SELECT 'CG-048', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'
  UNION SELECT 'TS-049', 'https://images.unsplash.com/photo-1558306441-0ec97c0f0f4c?w=500'
  UNION SELECT 'KE-050', 'https://images.unsplash.com/photo-1558306441-0ec97c0f0f4c?w=500'
) imgs ON p.sku = imgs.sku
WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE productId = p.id LIMIT 1);
