/**
 * Banner controller - Homepage carousel + Sellers page banner
 */

import { prisma } from '../config/db.js';

export const getAll = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
    });
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

export const getSellersBanner = async (req, res, next) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'sellers_page_banner' },
    });
    const imageUrl = setting?.value || null;
    res.json({ success: true, data: { imageUrl } });
  } catch {
    res.json({ success: true, data: { imageUrl: null } });
  }
};
