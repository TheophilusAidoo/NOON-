/**
 * Auth controller - Register, Login, Logout, Refresh
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { generateTokens } from '../utils/jwt.js';
import { sendTokens, clearTokens } from '../utils/sendTokens.js';
import { verifyRefreshToken } from '../utils/jwt.js';
import { AppError } from '../middleware/error.middleware.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, storeName, storeDescription, logo, banner } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER',
        isApproved: role === 'SELLER' ? false : null,
      },
    });

    if (role === 'SELLER') {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          storeName: storeName || `${name}'s Store`,
          storeDescription: storeDescription || null,
          logo: logo || null,
          banner: banner || null,
        },
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, role: true, isVerified: true, isApproved: true },
    });

    sendTokens(res, accessToken, refreshToken, userData);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
    };

    sendTokens(res, accessToken, refreshToken, userData);
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  clearTokens(res);
  res.json({ success: true, message: 'Logged out' });
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }

    const { userId } = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, isVerified: true, isApproved: true },
    });

    if (!user) {
      throw new AppError('User not found', 401);
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id);
    sendTokens(res, accessToken, newRefreshToken, user);
  } catch (err) {
    next(err);
  }
};

/** Debug: check admin user in DB (no auth) - remove in production */
export const debugAdmin = async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@noonshop.com' },
      select: { id: true, email: true, role: true, isVerified: true },
    });
    res.json({ admin: admin || 'NOT FOUND' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isApproved: true,
        sellerProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
