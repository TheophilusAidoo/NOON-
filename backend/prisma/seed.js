/**
 * Database seed - Categories, Brands, Admin user, Sample data
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin user - always reset password to Admin@123 when seeding
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@noonshop.com' },
    update: { password: adminPassword, role: 'ADMIN', isVerified: true },
    create: {
      name: 'Admin',
      email: 'admin@noonshop.com',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('Admin ready:', admin.email, '(password: Admin@123)');

  // Categories with online images and promo labels
  const categories = [
    { name: 'Phones & Tablets', slug: 'phones-tablets', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', promoLabel: 'UP TO -25%' },
    { name: 'Appliances', slug: 'appliances', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', promoLabel: 'UP TO -30%' },
    { name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400', promoLabel: 'UP TO -60%' },
    { name: 'TV & Audio', slug: 'tv-audio', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', promoLabel: 'UP TO -30%' },
    { name: 'Beauty Must Have', slug: 'beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400', promoLabel: 'UP TO -60%' },
    { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', promoLabel: 'UP TO -30%' },
    { name: 'Automobile Deals', slug: 'automobile', image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', promoLabel: 'UP TO -30%' },
    { name: 'Computing', slug: 'computing', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400', promoLabel: 'UP TO -30%' },
    { name: 'Home & Office', slug: 'home-office', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', promoLabel: 'UP TO -50%' },
    { name: 'Sneakers', slug: 'sneakers', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', promoLabel: 'UP TO -35%' },
    { name: 'Mobile Accessories', slug: 'mobile-accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', promoLabel: 'UP TO -40%' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { image: cat.image, promoLabel: cat.promoLabel },
      create: cat,
    });
  }
  console.log('Categories created');

  // Brands with images for homepage cards
  const brands = [
    { name: 'Apple', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400' },
    { name: 'Samsung', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400' },
    { name: 'Nike', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    { name: 'Adidas', image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=400' },
    { name: 'Sony', image: 'https://images.unsplash.com/photo-1618442674654-739b7d2e1f97?w=400' },
    { name: 'LG', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400' },
    { name: 'Philips', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { name: 'Bosch', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400' },
  ];
  for (const b of brands) {
    const existing = await prisma.brand.findFirst({ where: { name: b.name } });
    if (existing) {
      await prisma.brand.update({ where: { id: existing.id }, data: { image: b.image } });
    } else {
      await prisma.brand.create({ data: b });
    }
  }
  console.log('Brands created');

  // Banners (online images)
  const banners = [
    { title: 'Summer Sale', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', linkUrl: '/products?category=electronics', position: 0 },
    { title: 'New Arrivals', imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200', linkUrl: '/products', position: 1 },
    { title: 'Flash Deals', imageUrl: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200', linkUrl: '/products?flash=true', position: 2 },
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }
  console.log('Banners created');

  // Sample seller & products (if no products exist)
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const sellerPass = await bcrypt.hash('Seller@123', 12);
    const seller = await prisma.user.create({
      data: {
        name: 'Test Seller',
        email: 'seller@noonshop.com',
        password: sellerPass,
        role: 'SELLER',
        isVerified: true,
        isApproved: true,
      },
    });

    await prisma.sellerProfile.create({
      data: {
        userId: seller.id,
        storeName: 'Tech Paradise',
        storeDescription: 'Best electronics at best prices',
      },
    });

    const electronics = await prisma.category.findFirst({ where: { slug: 'electronics' } });
    const fashion = await prisma.category.findFirst({ where: { slug: 'fashion' } });
    const apple = await prisma.brand.findFirst({ where: { name: 'Apple' } });
    const nike = await prisma.brand.findFirst({ where: { name: 'Nike' } });

    const products = [
      {
        sellerId: seller.id,
        categoryId: electronics.id,
        brandId: apple.id,
        title: 'Wireless Bluetooth Headphones',
        description: 'Premium sound quality, 30hr battery',
        price: 99.99,
        discountPrice: 79.99,
        stock: 50,
        sku: 'WH-001',
        isFeatured: true,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'],
      },
      {
        sellerId: seller.id,
        categoryId: electronics.id,
        brandId: apple.id,
        title: 'Smart Watch Pro',
        description: 'Track fitness, receive notifications',
        price: 299.99,
        stock: 30,
        sku: 'SW-002',
        isFeatured: true,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      },
      {
        sellerId: seller.id,
        categoryId: fashion.id,
        brandId: nike.id,
        title: 'Running Shoes Elite',
        description: 'Lightweight, breathable, perfect for marathon',
        price: 129.99,
        discountPrice: 99.99,
        stock: 100,
        sku: 'RS-003',
        isFeatured: true,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
      },
    ];

    for (const p of products) {
      const { images, ...prod } = p;
      const product = await prisma.product.create({
        data: { ...prod, images: { create: images.map((url) => ({ imageUrl: url })) } },
      });
    }
    console.log('Sample products created');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
