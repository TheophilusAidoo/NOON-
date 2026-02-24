/**
 * Admin - approve seller deposits, list pending deposits, deposit history
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { parseLevelsConfig, getLevelForRecharge } from '../utils/sellerLevels.js';

export const getDepositHistory = async (req, res, next) => {
  try {
    const deposits = await prisma.sellerDeposit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const withSellers = await Promise.all(
      deposits.map(async (d) => {
        const user = await prisma.user.findUnique({
          where: { id: d.sellerId },
          select: { id: true, name: true, email: true },
        });
        const profile = await prisma.sellerProfile.findUnique({
          where: { userId: d.sellerId },
        });
        return {
          ...d,
          seller: user,
          currentLevel: profile?.storeLevel,
          currentRecharge: profile?.cumulativeRecharge,
        };
      })
    );

    res.json({ success: true, data: withSellers });
  } catch (err) {
    next(err);
  }
};

export const getPendingDeposits = async (req, res, next) => {
  try {
    const deposits = await prisma.sellerDeposit.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    const withSellers = await Promise.all(
      deposits.map(async (d) => {
        const user = await prisma.user.findUnique({
          where: { id: d.sellerId },
          select: { id: true, name: true, email: true },
        });
        const profile = await prisma.sellerProfile.findUnique({
          where: { userId: d.sellerId },
        });
        return {
          ...d,
          seller: user,
          currentLevel: profile?.storeLevel,
          currentRecharge: profile?.cumulativeRecharge,
        };
      })
    );

    res.json({ success: true, data: withSellers });
  } catch (err) {
    next(err);
  }
};

export const approveDeposit = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deposit = await prisma.sellerDeposit.findUnique({
      where: { id },
    });
    if (!deposit || deposit.status !== 'pending') {
      throw new AppError('Deposit not found or already processed', 404);
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: deposit.sellerId },
    });
    if (!profile) {
      throw new AppError('Seller profile not found', 404);
    }

    const newRecharge = profile.cumulativeRecharge + deposit.amount;
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'seller_levels' },
    });
    const levelsConfig = parseLevelsConfig(setting?.value);
    const newLevel = getLevelForRecharge(levelsConfig, newRecharge);

    await prisma.$transaction([
      prisma.sellerDeposit.update({
        where: { id },
        data: { status: 'approved', updatedAt: new Date() },
      }),
      prisma.sellerProfile.update({
        where: { userId: deposit.sellerId },
        data: {
          cumulativeRecharge: newRecharge,
          storeLevel: newLevel,
          updatedAt: new Date(),
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Deposit approved. Seller level updated.',
      data: { newLevel, newRecharge },
    });
  } catch (err) {
    next(err);
  }
};
