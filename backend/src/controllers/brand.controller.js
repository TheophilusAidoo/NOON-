/**
 * Brand controller
 */

import { prisma } from '../config/db.js';

export const getAll = async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json({ success: true, data: brands });
  } catch (err) {
    next(err);
  }
};
