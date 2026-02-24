/**
 * Admin - view and manage seller withdrawal requests
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

export const getWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const withSellers = await Promise.all(
      withdrawals.map(async (w) => {
        const user = await prisma.user.findUnique({
          where: { id: w.sellerId },
          select: { id: true, name: true, email: true },
        });
        return {
          ...w,
          seller: user,
        };
      })
    );

    res.json({ success: true, data: withSellers });
  } catch (err) {
    next(err);
  }
};

export const updateWithdrawalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      throw new AppError('Provide status: approved or rejected', 400);
    }

    const withdrawal = await prisma.withdrawalRequest.findUnique({
      where: { id },
    });
    if (!withdrawal) throw new AppError('Withdrawal not found', 404);
    if (withdrawal.status !== 'pending') {
      throw new AppError(`Withdrawal already ${withdrawal.status}`, 400);
    }

    await prisma.withdrawalRequest.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: { ...withdrawal, status }, message: `Withdrawal ${status}` });
  } catch (err) {
    next(err);
  }
};
