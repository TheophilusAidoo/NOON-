/**
 * Manual payment methods - Admin CRUD + public list
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

/** Admin: list all */
export const adminList = async (req, res, next) => {
  try {
    const list = await prisma.manualPaymentMethod.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    res.json({ success: true, data: list });
  } catch (err) {
    // Table may not exist - run database/add-manual-payment-methods.sql
    const msg = err?.message || '';
    if (err?.code === 'P2021' || msg.includes('does not exist') || msg.includes("doesn't exist") || msg.includes('manual_payment_methods')) {
      return res.json({ success: true, data: [] });
    }
    next(err);
  }
};

/** Admin: create */
export const adminCreate = async (req, res, next) => {
  try {
    const { cryptoName, walletAddress, qrCodeUrl, active, sortOrder } = req.body;
    if (!cryptoName?.trim() || !walletAddress?.trim()) {
      throw new AppError('Crypto name and wallet address are required', 400);
    }
    const created = await prisma.manualPaymentMethod.create({
      data: {
        cryptoName: cryptoName.trim(),
        walletAddress: walletAddress.trim(),
        qrCodeUrl: qrCodeUrl?.trim() || null,
        active: active !== false,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
      },
    });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
};

/** Admin: update */
export const adminUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cryptoName, walletAddress, qrCodeUrl, active, sortOrder } = req.body;
    const update = {};
    if (cryptoName !== undefined) update.cryptoName = cryptoName.trim();
    if (walletAddress !== undefined) update.walletAddress = walletAddress.trim();
    if (qrCodeUrl !== undefined) update.qrCodeUrl = qrCodeUrl?.trim() || null;
    if (typeof active === 'boolean') update.active = active;
    if (typeof sortOrder === 'number') update.sortOrder = sortOrder;

    const updated = await prisma.manualPaymentMethod.update({
      where: { id },
      data: update,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/** Admin: delete */
export const adminDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.manualPaymentMethod.delete({ where: { id } });
    res.json({ success: true, message: 'Payment method removed' });
  } catch (err) {
    next(err);
  }
};

/** Public: list active (for checkout) */
export const publicList = async (req, res, next) => {
  try {
    const list = await prisma.manualPaymentMethod.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, cryptoName: true, walletAddress: true, qrCodeUrl: true },
    });
    res.json({ success: true, data: list });
  } catch (err) {
    const msg = err?.message || '';
    if (err?.code === 'P2021' || msg.includes('does not exist') || msg.includes("doesn't exist") || msg.includes('manual_payment_methods')) {
      return res.json({ success: true, data: [] });
    }
    next(err);
  }
};
