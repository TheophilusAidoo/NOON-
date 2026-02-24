/**
 * Review controller - Create review (verified purchase only)
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    // Verify purchase
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: req.user.id,
          paymentStatus: 'PAID',
        },
      },
    });

    if (!purchase) {
      throw new AppError('You can only review products you have purchased', 403);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const review = await prisma.review.upsert({
      where: {
        userId_productId: { userId: req.user.id, productId },
      },
      create: { userId: req.user.id, productId, rating, comment },
      update: { rating, comment },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};
