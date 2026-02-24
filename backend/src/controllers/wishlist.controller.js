/**
 * Wishlist controller
 */

import { prisma } from '../config/db.js';

export const getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            images: { take: 1 },
            category: { select: { name: true } },
          },
        },
      },
    });

    res.json({ success: true, data: items.map((i) => i.product) });
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await prisma.wishlist.upsert({
      where: {
        userId_productId: { userId: req.user.id, productId },
      },
      create: { userId: req.user.id, productId },
      update: {},
    });

    res.status(201).json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, productId },
    });

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};
