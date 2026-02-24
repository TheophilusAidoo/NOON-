/**
 * JWT Authentication Middleware
 * Verifies Access Token and attaches user to request
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { AppError } from './error.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET must be defined');

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isApproved: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token', 401));
    }
    next(err);
  }
};

/**
 * Optional auth - doesn't fail if no token, just doesn't set user
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isApproved: true,
      },
    });

    if (user) req.user = user;
    next();
  } catch {
    next();
  }
};
