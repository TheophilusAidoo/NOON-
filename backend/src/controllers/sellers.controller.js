/**
 * Public sellers controller - list sellers and seller products (no auth)
 */

import { prisma } from '../config/db.js';

const productListInclude = {
  images: { take: 1 },
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true } },
  _count: { select: { reviews: true } },
};

export const getAllSellers = async (req, res, next) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER', isApproved: true },
      select: {
        id: true,
        name: true,
        sellerProfile: { select: { storeName: true, storeDescription: true, logo: true, banner: true, rating: true, totalSales: true } },
        _count: { select: { products: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: sellers });
  } catch (err) {
    next(err);
  }
};

export const getSellerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const seller = await prisma.user.findFirst({
      where: { id, role: 'SELLER', isApproved: true },
      select: {
        id: true,
        name: true,
        sellerProfile: { select: { storeName: true, storeDescription: true, logo: true, banner: true, rating: true, totalSales: true } },
        _count: { select: { products: true } },
      },
    });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    res.json({ success: true, data: seller });
  } catch (err) {
    next(err);
  }
};

export const getSellerProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const seller = await prisma.user.findFirst({
      where: { id, role: 'SELLER', isApproved: true },
      select: { id: true },
    });
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: id, stock: { gt: 0 } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: productListInclude,
      }),
      prisma.product.count({ where: { sellerId: id, stock: { gt: 0 } } }),
    ]);

    const withRating = await Promise.all(
      products.map(async (p) => {
        const agg = await prisma.review.aggregate({
          where: { productId: p.id },
          _avg: { rating: true },
        });
        return {
          ...p,
          averageRating: Math.round((agg._avg.rating || 0) * 10) / 10,
          reviewCount: p._count.reviews,
        };
      })
    );

    res.json({
      success: true,
      data: {
        products: withRating,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    next(err);
  }
};
