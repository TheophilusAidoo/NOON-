/**
 * Admin banner CRUD + Sellers page banner
 */

import { prisma } from '../config/db.js';

export const getSellersBanner = async (req, res, next) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'sellers_page_banner' },
    });
    res.json({ success: true, data: { imageUrl: setting?.value || '' } });
  } catch {
    res.json({ success: true, data: { imageUrl: '' } });
  }
};

export const updateSellersBanner = async (req, res, next) => {
  try {
    const { imageUrl } = req.body;
    await prisma.siteSetting.upsert({
      where: { key: 'sellers_page_banner' },
      create: { key: 'sellers_page_banner', value: imageUrl || '' },
      update: { value: imageUrl || '' },
    });
    res.json({ success: true, data: { imageUrl: imageUrl || '' } });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { position: 'asc' } });
    res.json({ success: true, data: banners });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const banner = await prisma.banner.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: banner });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    next(err);
  }
};
