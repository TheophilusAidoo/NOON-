/**
 * Seller deposit / recharge - request deposit, admin approves to upgrade level
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { parseLevelsConfig, getLevelForRecharge } from '../utils/sellerLevels.js';

export const requestDeposit = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      throw new AppError('Invalid deposit amount', 400);
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      throw new AppError('Seller profile not found', 404);
    }

    const deposit = await prisma.sellerDeposit.create({
      data: {
        sellerId: req.user.id,
        amount: parseFloat(amount),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Deposit request submitted. Awaiting admin approval.',
      data: deposit,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyDeposits = async (req, res, next) => {
  try {
    let deposits = [];
    let profile = null;

    try {
      [deposits, profile] = await Promise.all([
        prisma.sellerDeposit.findMany({
          where: { sellerId: req.user.id },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.sellerProfile.findUnique({
          where: { userId: req.user.id },
        }),
      ]);
    } catch (dbErr) {
      console.warn('[Deposits] DB error (seller_deposits table may not exist):', dbErr.message);
      deposits = [];
      profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } }).catch(() => null);
    }

    const setting = await prisma.siteSetting.findUnique({ where: { key: 'seller_levels' } }).catch(() => null);
    const levelsConfig = parseLevelsConfig(setting?.value);

    const storeLevel = profile?.storeLevel ?? 'C';
    const cumulativeRecharge = profile?.cumulativeRecharge ?? 0;

    res.json({
      success: true,
      data: {
        deposits,
        profile: profile
          ? {
              storeLevel,
              cumulativeRecharge,
              nextLevel: getNextLevelInfo(levelsConfig, storeLevel, cumulativeRecharge),
            }
          : { storeLevel: 'C', cumulativeRecharge: 0, nextLevel: null },
      },
    });
  } catch (err) {
    next(err);
  }
};

function getNextLevelInfo(config, currentLevel, cumulativeRecharge) {
  const order = ['C', 'B', 'A', 'S'];
  const idx = order.indexOf(currentLevel);
  if (idx < 0 || idx >= order.length - 1) return null;
  const next = order[idx + 1];
  const nextCfg = config[next];
  if (!nextCfg) return null;
  const remaining = nextCfg.rechargeRequired - cumulativeRecharge;
  return {
    level: next,
    rechargeRequired: nextCfg.rechargeRequired,
    remaining: Math.max(0, remaining),
    productLimit: nextCfg.productLimit,
    profitMargin: nextCfg.profitMargin,
  };
}

export const getMyLevel = async (req, res, next) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      throw new AppError('Seller profile not found', 404);
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'seller_levels' },
    });
    const levelsConfig = parseLevelsConfig(setting?.value);
    const levelCfg = levelsConfig[profile.storeLevel] || levelsConfig.C;

    const wholesaleSpend = profile.wholesaleSpend ?? 0;
    const availableBalance = (profile.cumulativeRecharge ?? 0) - wholesaleSpend;

    const paidWholesaleItems = await prisma.orderItem.findMany({
      where: {
        sellerId: req.user.id,
        wholesaleCost: { not: null },
        sellerPaidToAdmin: true,
      },
      select: { price: true, quantity: true, wholesaleCost: true },
    });
    const accumulatedProfit = paidWholesaleItems.reduce(
      (sum, i) => sum + (i.price * i.quantity - (i.wholesaleCost ?? 0)),
      0
    );

    res.json({
      success: true,
      data: {
        storeLevel: profile.storeLevel,
        cumulativeRecharge: profile.cumulativeRecharge,
        wholesaleSpend,
        availableBalance,
        accumulatedProfit,
        productLimit: levelCfg?.productLimit ?? 20,
        profitMargin: levelCfg?.profitMargin ?? 15,
        nextLevel: getNextLevelInfo(levelsConfig, profile.storeLevel, profile.cumulativeRecharge),
      },
    });
  } catch (err) {
    next(err);
  }
};
