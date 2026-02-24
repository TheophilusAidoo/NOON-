/**
 * Seed 90+ products with online images
 * Run: cd backend && npm run seed-products
 * Or: node prisma/seed-products.js
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS = [
  { title: 'Wireless Bluetooth Headphones', desc: 'Premium sound quality, 30hr battery, noise cancellation', price: 99.99, discount: 79.99, stock: 50, sku: 'WH-001', cat: 'electronics', brand: 'Apple', imgs: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'], featured: true },
  { title: 'Smart Watch Pro', desc: 'Track fitness, heart rate, GPS, receive notifications', price: 299.99, discount: null, stock: 30, sku: 'SW-002', cat: 'electronics', brand: 'Apple', imgs: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500'], featured: true },
  { title: 'Running Shoes Elite', desc: 'Lightweight, breathable, perfect for marathon and daily runs', price: 129.99, discount: 99.99, stock: 100, sku: 'RS-003', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500'], featured: true },
  { title: 'Laptop Pro 15"', desc: 'Intel i7, 16GB RAM, 512GB SSD, stunning display', price: 1299, discount: 1149, stock: 25, sku: 'LP-004', cat: 'computing', brand: 'Apple', imgs: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'], featured: true },
  { title: '4K Smart TV 55"', desc: 'Crystal clear 4K UHD, HDR, smart streaming built-in', price: 699, discount: 599, stock: 40, sku: 'TV-005', cat: 'tv-audio', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=500'], featured: true },
  { title: 'Wireless Earbuds', desc: 'True wireless, 24hr total battery, touch controls', price: 149.99, discount: 119.99, stock: 75, sku: 'WE-006', cat: 'mobile-accessories', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 'https://images.unsplash.com/photo-1577174881658-45a92c92c69b?w=500'], featured: false },
  { title: 'Gaming Mouse', desc: '16000 DPI, RGB lighting, programmable buttons', price: 79.99, discount: 59.99, stock: 120, sku: 'GM-007', cat: 'computing', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1527814050087-3793815479db?w=500', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500'], featured: false },
  { title: 'Mechanical Keyboard', desc: 'Cherry MX switches, RGB, aluminium frame', price: 129.99, stock: 60, sku: 'MK-008', cat: 'computing', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500'], featured: false },
  { title: 'Portable Power Bank 20000mAh', desc: 'Fast charge, USB-C, dual output', price: 49.99, discount: 39.99, stock: 200, sku: 'PB-009', cat: 'mobile-accessories', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'], featured: false },
  { title: 'Bluetooth Speaker', desc: 'Waterproof, 12hr battery, 360° sound', price: 89.99, discount: 69.99, stock: 80, sku: 'BS-010', cat: 'tv-audio', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500'], featured: true },
  { title: 'Air Purifier', desc: 'HEPA filter, quiet operation, removes 99.97% particles', price: 199.99, discount: 169.99, stock: 35, sku: 'AP-011', cat: 'home-office', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500'], featured: false },
  { title: 'Espresso Machine', desc: 'Barista-quality espresso at home, 15-bar pump', price: 349.99, stock: 20, sku: 'EM-012', cat: 'appliances', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500'], featured: true },
  { title: 'Vacuum Cleaner', desc: 'Cordless, strong suction, 40min runtime', price: 279.99, discount: 239.99, stock: 45, sku: 'VC-013', cat: 'appliances', brand: 'Bosch', imgs: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500'], featured: false },
  { title: 'Stainless Steel Mixer', desc: 'Professional grade, 1000W, 10 speeds', price: 159.99, stock: 55, sku: 'SM-014', cat: 'appliances', brand: 'Bosch', imgs: ['https://images.unsplash.com/photo-1570222094114-d1bf719b2f96?w=500'], featured: false },
  { title: 'Winter Parka', desc: 'Waterproof, insulated, premium down fill', price: 249.99, discount: 199.99, stock: 40, sku: 'WP-015', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500', 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=500'], featured: true },
  { title: 'Classic Sneakers', desc: 'Timeless design, comfortable all-day wear', price: 89.99, discount: 74.99, stock: 150, sku: 'CS-016', cat: 'sneakers', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500', 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=500'], featured: true },
  { title: 'Leather Wallet', desc: 'Genuine leather, RFID blocking, slim design', price: 59.99, stock: 90, sku: 'LW-017', cat: 'fashion', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'], featured: false },
  { title: 'Sunglasses Aviator', desc: 'Polarized lenses, UV400, metal frame', price: 119.99, discount: 99.99, stock: 70, sku: 'SA-018', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'], featured: false },
  { title: 'Face Moisturizer', desc: 'SPF 30, hydrating, suitable for all skin types', price: 34.99, stock: 180, sku: 'FM-019', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'], featured: false },
  { title: 'Hair Dryer Professional', desc: 'Ionic technology, 3 heat settings, concentrator nozzle', price: 79.99, discount: 64.99, stock: 65, sku: 'HD-020', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=500'], featured: false },
  { title: 'USB-C Hub 7-in-1', desc: 'HDMI, SD card, USB 3.0, charging passthrough', price: 69.99, discount: 54.99, stock: 110, sku: 'UH-021', cat: 'computing', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=500'], featured: false },
  { title: 'External SSD 1TB', desc: 'Portable, USB 3.2, 1050MB/s read speed', price: 129.99, stock: 85, sku: 'SSD-022', cat: 'computing', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500'], featured: false },
  { title: 'Monitor 27" 4K', desc: 'IPS panel, 99% sRGB, HDR ready', price: 449.99, discount: 399.99, stock: 30, sku: 'MO-023', cat: 'computing', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500'], featured: true },
  { title: 'Webcam HD 1080p', desc: 'Auto-focus, built-in mic, for streaming & meetings', price: 79.99, stock: 95, sku: 'WC-024', cat: 'computing', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500'], featured: false },
  { title: 'Smartphone Stand', desc: 'Adjustable angle, wireless charging compatible', price: 29.99, stock: 250, sku: 'SS-025', cat: 'mobile-accessories', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500'], featured: false },
  { title: 'Car Phone Mount', desc: 'Magnetic, vent/dashboard mount, one-hand operation', price: 24.99, discount: 19.99, stock: 300, sku: 'CPM-026', cat: 'mobile-accessories', brand: 'Bosch', imgs: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500'], featured: false },
  { title: 'Desk Lamp LED', desc: 'Dimmable, USB charging port, modern design', price: 49.99, stock: 75, sku: 'DL-027', cat: 'home-office', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'], featured: false },
  { title: 'Office Chair Ergonomic', desc: 'Lumbar support, height adjustable, breathable mesh', price: 279.99, discount: 229.99, stock: 25, sku: 'OC-028', cat: 'home-office', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500'], featured: true },
  { title: 'Yoga Mat 6mm', desc: 'Non-slip, eco-friendly TPE, carry strap included', price: 44.99, stock: 120, sku: 'YM-029', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b4f?w=500'], featured: false },
  { title: 'Fitness Tracker Band', desc: 'Heart rate, sleep tracking, 7-day battery', price: 59.99, discount: 49.99, stock: 140, sku: 'FT-030', cat: 'electronics', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=500'], featured: false },
  { title: 'Tablet 10"', desc: 'Full HD display, 64GB storage, perfect for media', price: 299.99, discount: 249.99, stock: 45, sku: 'TB-031', cat: 'phones-tablets', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'], featured: true },
  { title: 'Smart Speaker', desc: 'Voice assistant, multi-room audio, rich bass', price: 99.99, stock: 60, sku: 'SSP-032', cat: 'tv-audio', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1543512214-318c7553f230?w=500'], featured: false },
  { title: 'Noise Cancelling Over-Ear', desc: 'Premium comfort, 30hr battery, foldable', price: 249.99, discount: 199.99, stock: 35, sku: 'NC-033', cat: 'electronics', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1504274066651-8d31a73b85f3?w=500'], featured: true },
  { title: 'Electric Toothbrush', desc: 'Sonic technology, 5 modes, 2-week battery', price: 89.99, stock: 100, sku: 'ET-034', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1626218174358-36f7e55d31b4?w=500'], featured: false },
  { title: 'Skincare Serum', desc: 'Vitamin C, hyaluronic acid, brightening formula', price: 54.99, discount: 44.99, stock: 130, sku: 'SK-035', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'], featured: false },
  { title: 'Backpack 25L', desc: 'Laptop compartment, water-resistant, ergonomic straps', price: 69.99, stock: 85, sku: 'BP-036', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'], featured: false },
  { title: 'Running Shorts', desc: 'Lightweight, quick-dry, reflective details', price: 39.99, stock: 160, sku: 'RSH-037', cat: 'sneakers', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500'], featured: false },
  { title: 'Wireless Charging Pad', desc: 'Qi certified, 15W fast charge, LED indicator', price: 34.99, stock: 180, sku: 'WCP-038', cat: 'mobile-accessories', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1624726175512-19c9a8542b81?w=500'], featured: false },
  { title: 'Cable Management Kit', desc: 'Cable clips, sleeves, desk organizer', price: 19.99, stock: 220, sku: 'CMK-039', cat: 'home-office', brand: 'Bosch', imgs: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], featured: false },
  { title: 'Desk Organizer', desc: 'Multi-compartment, bamboo construction', price: 44.99, discount: 36.99, stock: 90, sku: 'DO-040', cat: 'home-office', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=500'], featured: false },
  // 50 more products (041-090)
  { title: 'Phone Case Leather', desc: 'Premium leather, mag-safe compatible', price: 34.99, stock: 200, sku: 'PCL-041', cat: 'mobile-accessories', brand: 'Apple', imgs: ['https://images.unsplash.com/photo-1601593346742-0c6252e1ea1e?w=500'], featured: false },
  { title: 'Laptop Sleeve 15"', desc: 'Neoprene, padded, fits 15" laptops', price: 29.99, discount: 24.99, stock: 150, sku: 'LS-042', cat: 'computing', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1584931422390-299d1c4a6f84?w=500'], featured: false },
  { title: 'Standing Desk Converter', desc: 'Sit-stand, height adjustable, keyboard tray', price: 189.99, stock: 40, sku: 'SDC-043', cat: 'home-office', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'], featured: true },
  { title: 'Dumbbells Set 20kg', desc: 'Adjustable, cast iron, rubber-coated', price: 149.99, stock: 60, sku: 'DS-044', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500'], featured: false },
  { title: 'Resistance Bands Set', desc: '5 levels, carry bag, workout guide included', price: 24.99, stock: 180, sku: 'RB-045', cat: 'fashion', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500'], featured: false },
  { title: 'Smart Scale', desc: 'Body composition, app sync, sleek glass design', price: 59.99, discount: 49.99, stock: 80, sku: 'SS-046', cat: 'electronics', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1559757175-5700dde675bc?w=500'], featured: false },
  { title: 'LED Strip Lights', desc: 'RGB, smart app, music sync, 5m reel', price: 39.99, stock: 120, sku: 'LSL-047', cat: 'home-office', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], featured: false },
  { title: 'Coffee Grinder', desc: 'Burr grinder, 15 settings, stainless steel', price: 79.99, stock: 55, sku: 'CG-048', cat: 'appliances', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'], featured: false },
  { title: 'Toaster 4-Slice', desc: 'Wide slots, 6 browning levels, bagel mode', price: 54.99, discount: 44.99, stock: 70, sku: 'TS-049', cat: 'appliances', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1558306441-0ec97c0f0f4c?w=500'], featured: false },
  { title: 'Kettle Electric', desc: '1.7L, boil-dry protection, 360° base', price: 45.99, stock: 95, sku: 'KE-050', cat: 'appliances', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1558306441-0ec97c0f0f4c?w=500'], featured: false },
  { title: 'Chef Knife 8"', desc: 'Japanese steel, ergonomic handle', price: 89.99, stock: 45, sku: 'CK-051', cat: 'appliances', brand: 'Bosch', imgs: ['https://images.unsplash.com/photo-1593618998160-e24ab2d34f1e?w=500'], featured: false },
  { title: 'Cutting Board Set', desc: 'Bamboo, 3 sizes, juice groove', price: 34.99, stock: 110, sku: 'CBS-052', cat: 'home-office', brand: 'Bosch', imgs: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'], featured: false },
  { title: 'Memory Foam Pillow', desc: 'Ergonomic, machine washable cover', price: 49.99, discount: 39.99, stock: 130, sku: 'MFP-053', cat: 'home-office', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500'], featured: false },
  { title: 'Bed Sheet Set', desc: 'Egyptian cotton, 800 thread count, king', price: 119.99, stock: 50, sku: 'BSS-054', cat: 'home-office', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500'], featured: false },
  { title: 'Throw Blanket', desc: 'Soft fleece, 50x60", machine washable', price: 39.99, stock: 90, sku: 'TB-055', cat: 'home-office', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'], featured: false },
  { title: 'Perfume Eau de Toilette', desc: 'Long-lasting, floral notes, 100ml', price: 79.99, discount: 64.99, stock: 65, sku: 'PET-056', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1541643600914-78b084683601?w=500'], featured: true },
  { title: 'Lipstick Set', desc: '5 matte shades, long wear, cruelty-free', price: 34.99, stock: 100, sku: 'LSS-057', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500'], featured: false },
  { title: 'Makeup Brush Set', desc: '12 pcs, synthetic, velvet pouch', price: 44.99, stock: 85, sku: 'MBS-058', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'], featured: false },
  { title: 'Nail Polish Set', desc: '6 colors, chip-resistant, vegan', price: 24.99, stock: 150, sku: 'NPS-059', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500'], featured: false },
  { title: 'Sunscreen SPF 50', desc: 'Broad spectrum, water-resistant, 200ml', price: 29.99, stock: 140, sku: 'SSP-060', cat: 'beauty', brand: 'Philips', imgs: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500'], featured: false },
  { title: 'Canvas Sneakers Low', desc: 'Casual everyday, durable rubber sole', price: 64.99, discount: 54.99, stock: 120, sku: 'CSL-061', cat: 'sneakers', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'], featured: true },
  { title: 'Basketball Shoes', desc: 'High-top, cushioning, court grip', price: 129.99, stock: 55, sku: 'BSH-062', cat: 'sneakers', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'], featured: false },
  { title: 'Slip-On Loafers', desc: 'Comfort fit, leather upper', price: 79.99, stock: 70, sku: 'SOL-063', cat: 'sneakers', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=500'], featured: false },
  { title: 'Hiking Boots', desc: 'Waterproof, ankle support, rugged outsole', price: 149.99, discount: 129.99, stock: 40, sku: 'HB-064', cat: 'sneakers', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=500'], featured: false },
  { title: 'Sandals Sport', desc: 'Straps, cushioned footbed, outdoor ready', price: 44.99, stock: 95, sku: 'SPS-065', cat: 'sneakers', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1603487742131-4160ec999306?w=500'], featured: false },
  { title: 'Cotton T-Shirt Pack', desc: '3-pack, 100% cotton, crew neck', price: 29.99, stock: 250, sku: 'CTP-066', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], featured: false },
  { title: 'Denim Jacket', desc: 'Classic fit, 100% cotton denim', price: 89.99, discount: 74.99, stock: 60, sku: 'DJ-067', cat: 'fashion', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'], featured: true },
  { title: 'Polo Shirt', desc: 'Pique cotton, breathable, 3-button', price: 49.99, stock: 110, sku: 'PS-068', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500'], featured: false },
  { title: 'Chino Pants', desc: 'Slim fit, stretch, wool blend', price: 69.99, stock: 75, sku: 'CP-069', cat: 'fashion', brand: 'Adidas', imgs: ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500'], featured: false },
  { title: 'Hoodie Pullover', desc: 'Fleece lining, kangaroo pocket', price: 59.99, discount: 49.99, stock: 90, sku: 'HP-070', cat: 'fashion', brand: 'Nike', imgs: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'], featured: false },
  { title: 'Smartphone 128GB', desc: '6.5" AMOLED, triple camera, 5G', price: 599.99, discount: 499.99, stock: 35, sku: 'SPH-071', cat: 'phones-tablets', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'], featured: true },
  { title: 'E-Reader', desc: '6" E-ink, 32GB, built-in light', price: 119.99, stock: 50, sku: 'ER-072', cat: 'phones-tablets', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'], featured: false },
  { title: 'Phone Holder Car', desc: 'Vent clip, 360° rotation, sturdy grip', price: 19.99, stock: 200, sku: 'PHC-073', cat: 'mobile-accessories', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500'], featured: false },
  { title: 'Screen Protector Pack', desc: 'Tempered glass, 2-pack, easy install', price: 14.99, stock: 300, sku: 'SPP-074', cat: 'mobile-accessories', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'], featured: false },
  { title: 'USB-C Fast Charger', desc: '65W GaN, 3 ports, compact', price: 44.99, stock: 100, sku: 'UFC-075', cat: 'mobile-accessories', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=500'], featured: false },
  { title: 'HDMI Cable 2m', desc: '4K 60Hz, braided, gold plated', price: 12.99, stock: 250, sku: 'HC-076', cat: 'tv-audio', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500'], featured: false },
  { title: 'Soundbar 2.1', desc: 'Wireless subwoofer, Bluetooth', price: 199.99, discount: 169.99, stock: 45, sku: 'SB-077', cat: 'tv-audio', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1545454675382-9b3981a4f8b6?w=500'], featured: true },
  { title: 'Gaming Headset', desc: '7.1 surround, detachable mic, RGB', price: 89.99, stock: 80, sku: 'GH-078', cat: 'tv-audio', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500'], featured: false },
  { title: 'Turntable Bluetooth', desc: 'Vinyl player, built-in speakers', price: 149.99, stock: 30, sku: 'TTB-079', cat: 'tv-audio', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500'], featured: false },
  { title: 'Microphone USB', desc: 'Podcast-quality, plug and play', price: 79.99, discount: 64.99, stock: 55, sku: 'MUS-080', cat: 'tv-audio', brand: 'Sony', imgs: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500'], featured: false },
  { title: 'Router Wi-Fi 6', desc: 'Dual band, mesh ready, parental controls', price: 149.99, stock: 40, sku: 'RW-081', cat: 'computing', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500'], featured: false },
  { title: 'External HDD 2TB', desc: 'Portable, USB 3.0, shock resistant', price: 79.99, stock: 90, sku: 'EHD-082', cat: 'computing', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500'], featured: false },
  { title: 'Laptop Stand', desc: 'Aluminum, adjustable, cable management', price: 49.99, stock: 70, sku: 'LST-083', cat: 'computing', brand: 'Apple', imgs: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'], featured: false },
  { title: 'Tablet Stand', desc: 'Adjustable angle, foldable', price: 24.99, stock: 130, sku: 'TST-084', cat: 'computing', brand: 'Apple', imgs: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'], featured: false },
  { title: 'Cooling Pad Laptop', desc: '5 fans, LED, adjustable height', price: 39.99, stock: 60, sku: 'CPL-085', cat: 'computing', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500'], featured: false },
  { title: 'Printer All-in-One', desc: 'Print, scan, copy, wireless', price: 129.99, discount: 109.99, stock: 35, sku: 'PAO-086', cat: 'computing', brand: 'Samsung', imgs: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500'], featured: false },
  { title: 'Paper Shredder', desc: 'Cross-cut, 8 sheet capacity', price: 59.99, stock: 45, sku: 'PSh-087', cat: 'home-office', brand: 'Bosch', imgs: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'], featured: false },
  { title: 'Sticky Notes Pack', desc: 'Assorted colors, 6 pads, 300 sheets', price: 9.99, stock: 400, sku: 'SNP-088', cat: 'home-office', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500'], featured: false },
  { title: 'Pen Set Metal', desc: 'Ballpoint, 3 pack, executive style', price: 29.99, stock: 150, sku: 'PSM-089', cat: 'home-office', brand: 'Apple', imgs: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500'], featured: false },
  { title: 'Desk Pad Leather', desc: 'Large, mouse surface, wrist support', price: 44.99, stock: 80, sku: 'DPL-090', cat: 'home-office', brand: 'LG', imgs: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500'], featured: false },
];

// Logitech brand may not exist - use Sony as fallback
const BRAND_FALLBACK = 'Sony';

async function main() {
  console.log('Seeding 90+ products with online images...\n');

  // Ensure categories and brands exist (run main seed first if needed)
  const catCount = await prisma.category.count();
  const brandCount = await prisma.brand.count();
  if (catCount === 0 || brandCount === 0) {
    console.log('Run "npx prisma db seed" first to create categories and brands.');
    process.exit(1);
  }

  // Get seller: prefer test seller (has profile), else admin
  let seller = await prisma.user.findFirst({
    where: { email: 'seller@noonshop.com', role: 'SELLER' },
    include: { sellerProfile: true },
  });
  if (!seller) {
    seller = await prisma.user.findFirst({
      where: { email: 'admin@noonshop.com', role: 'ADMIN' },
    });
    if (!seller) {
      console.log('Creating admin and test seller...');
      const adminPass = await bcrypt.hash('Admin@123', 12);
      const admin = await prisma.user.upsert({
        where: { email: 'admin@noonshop.com' },
        update: {},
        create: { name: 'Admin', email: 'admin@noonshop.com', password: adminPass, role: 'ADMIN', isVerified: true },
      });
      const sellerPass = await bcrypt.hash('Seller@123', 12);
      const newSeller = await prisma.user.create({
        data: { name: 'Test Seller', email: 'seller@noonshop.com', password: sellerPass, role: 'SELLER', isVerified: true, isApproved: true },
      });
      await prisma.sellerProfile.create({
        data: { userId: newSeller.id, storeName: 'Tech Paradise', storeDescription: 'Best electronics' },
      });
      seller = newSeller;
    }
  }

  const categories = await prisma.category.findMany();
  const brands = await prisma.brand.findMany();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
  const brandMap = Object.fromEntries(brands.map((b) => [b.name, b]));

  let created = 0;
  let skipped = 0;

  for (const p of PRODUCTS) {
    const category = catMap[p.cat] || categories[0];
    const brand = brandMap[p.brand] || brandMap[BRAND_FALLBACK] || brands[0];

    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.product.create({
      data: {
        sellerId: seller.id,
        categoryId: category.id,
        brandId: brand.id,
        title: p.title,
        description: p.desc,
        price: p.price,
        discountPrice: p.discount,
        stock: p.stock,
        sku: p.sku,
        isFeatured: p.featured,
        images: { create: p.imgs.map((url) => ({ imageUrl: url })) },
      },
    });
    created++;
    console.log(`  + ${p.title}`);
  }

  console.log(`\nDone. Created ${created} products, skipped ${skipped} (already exist).`);
  const total = await prisma.product.count();
  console.log(`Total products in store: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
