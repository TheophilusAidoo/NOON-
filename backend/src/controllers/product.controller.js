/**
 * Product controller - CRUD, search, featured
 */

import { prisma } from '../config/db.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      flash,
      minPrice,
      maxPrice,
      minRating,
      search,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { stock: { gt: 0 } };

    if (category) where.categoryId = category;
    if (brand) where.brandId = brand;
    if (flash === 'true' || flash === true) where.discountPrice = { not: null };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (minRating) {
      where.reviews = {
        some: {},
      };
    }

    const validSort = ['price', 'createdAt', 'title'].includes(sort) ? sort : 'createdAt';
    const validOrder = order === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [validSort]: validOrder },
        include: {
          images: { take: 1 },
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Add average rating
    const productsWithRating = await Promise.all(
      products.map(async (p) => {
        const agg = await prisma.review.aggregate({
          where: { productId: p.id },
          _avg: { rating: true },
        });
        const avgRating = agg._avg.rating || 0;
        if (minRating && avgRating < parseFloat(minRating)) return null;
        return {
          ...p,
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: p._count.reviews,
        };
      })
    );

    const filtered = productsWithRating.filter(Boolean);

    res.json({
      success: true,
      data: {
        products: filtered,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        category: true,
        brand: true,
        variants: true,
        seller: {
          select: {
            id: true,
            name: true,
            sellerProfile: { select: { storeName: true, rating: true } },
          },
        },
        reviews: {
          include: { user: { select: { name: true } } },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const avgRating = await prisma.review.aggregate({
      where: { productId: id },
      _avg: { rating: true },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        ...product,
        averageRating: avgRating._avg.rating || 0,
        reviewCount: avgRating._count,
      },
    });
  } catch (err) {
    next(err);
  }
};

const productListInclude = {
  images: { take: 1 },
  category: { select: { name: true, slug: true } },
  brand: { select: { name: true } },
  _count: { select: { reviews: true } },
};

const productListIncludeWithSeller = {
  ...productListInclude,
  seller: {
    select: {
      id: true,
      sellerProfile: { select: { storeName: true, logo: true } },
    },
  },
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    let products = await prisma.product.findMany({
      where: { isFeatured: true, stock: { gt: 0 } },
      take: 15,
      include: productListInclude,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      products = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        take: 15,
        include: productListInclude,
        orderBy: { createdAt: 'desc' },
      });
    }

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

    res.json({ success: true, data: withRating });
  } catch (err) {
    next(err);
  }
};

export const getFlashDeals = async (req, res, next) => {
  try {
    let products = await prisma.product.findMany({
      where: {
        discountPrice: { not: null },
        stock: { gt: 0 },
      },
      take: 15,
      include: productListInclude,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      products = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        take: 15,
        include: productListInclude,
        orderBy: { createdAt: 'desc' },
      });
    }

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

    res.json({ success: true, data: withRating });
  } catch (err) {
    next(err);
  }
};

export const getSellerProducts = async (req, res, next) => {
  try {
    let products = await prisma.product.findMany({
      where: {
        stock: { gt: 0 },
        seller: {
          role: 'SELLER',
          isApproved: true,
        },
      },
      take: 16,
      include: productListIncludeWithSeller,
      orderBy: { createdAt: 'desc' },
    });

    if (products.length === 0) {
      products = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        take: 16,
        include: productListIncludeWithSeller,
        orderBy: { createdAt: 'desc' },
      });
    }

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

    res.json({ success: true, data: withRating });
  } catch (err) {
    next(err);
  }
};
