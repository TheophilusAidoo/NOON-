/**
 * Newsletter subscription - public subscribe + admin list
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

/** Public: subscribe (no auth) */
export const subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      throw new AppError('Email is required', 400);
    }
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new AppError('Invalid email address', 400);
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      create: { email: normalized },
      update: {},
    });

    res.json({ success: true, message: 'Thank you for subscribing!' });
  } catch (err) {
    if (err.code === 'P2021' || err?.message?.includes('newsletter_subscribers')) {
      return res.status(503).json({ success: false, message: 'Newsletter not available yet. Run database/add-newsletter-subscribers.sql' });
    }
    next(err);
  }
};

/** Admin: list all subscribers */
export const adminList = async (req, res, next) => {
  try {
    const list = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: list });
  } catch (err) {
    if (err.code === 'P2021' || err?.message?.includes('newsletter_subscribers')) {
      return res.json({ success: true, data: [] });
    }
    next(err);
  }
};
