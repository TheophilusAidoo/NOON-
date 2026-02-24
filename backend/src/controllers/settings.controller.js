/**
 * Settings controller - public settings (currency, seller levels) and admin update
 */

import { prisma } from '../config/db.js';
import { getDefaultLevels, parseLevelsConfig } from '../utils/sellerLevels.js';

const DEFAULT_CURRENCY = { code: 'USD', symbol: '$' };
const DEFAULT_FOOTER = {
  tagline: 'Your trusted multi-vendor marketplace. Electronics, fashion, home & more — all in one place.',
  address: '123 Commerce Street, Retail City',
  phone: '+1 234 567 8900',
};

export const getPublicSettings = async (req, res) => {
  let currency = DEFAULT_CURRENCY;
  let footer = { ...DEFAULT_FOOTER };
  try {
    const all = await prisma.siteSetting.findMany({
      where: { key: { in: ['currency', 'footer_tagline', 'footer_address', 'footer_phone'] } },
    });
    for (const s of all) {
      try {
        if (s.key === 'currency') currency = JSON.parse(s.value);
        else if (s.key === 'footer_tagline') footer.tagline = s.value;
        else if (s.key === 'footer_address') footer.address = s.value;
        else if (s.key === 'footer_phone') footer.phone = s.value;
      } catch {
        if (s.key === 'currency') currency = DEFAULT_CURRENCY;
      }
    }
  } catch {
    // Table may not exist yet - return defaults, never 500
  }
  res.json({ success: true, data: { currency, footer } });
};

export const getSellerLevels = async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'seller_levels' },
    });
    const levels = parseLevelsConfig(setting?.value);
    res.json({ success: true, data: levels });
  } catch {
    res.json({ success: true, data: getDefaultLevels() });
  }
};

export const getSettings = async (req, res) => {
  const settings = {
    currency: DEFAULT_CURRENCY,
    sellerLevels: getDefaultLevels(),
    footer: { ...DEFAULT_FOOTER },
  };
  try {
    const all = await prisma.siteSetting.findMany();
    for (const s of all) {
      try {
        if (s.key === 'currency') settings.currency = JSON.parse(s.value);
        else if (s.key === 'seller_levels') settings.sellerLevels = parseLevelsConfig(s.value);
        else if (s.key === 'footer_tagline') settings.footer.tagline = s.value;
        else if (s.key === 'footer_address') settings.footer.address = s.value;
        else if (s.key === 'footer_phone') settings.footer.phone = s.value;
        else settings[s.key] = s.value;
      } catch {
        if (s.key === 'currency' || s.key === 'seller_levels') settings[s.key] = s.value;
        else settings[s.key] = s.value;
      }
    }
  } catch {
    // Table may not exist - return defaults
  }
  res.json({ success: true, data: settings });
};

export const updateSettings = async (req, res) => {
  const { currency, sellerLevels, footer } = req.body;
  if (!currency && !sellerLevels && !footer) {
    return res.status(400).json({ success: false, message: 'Provide currency, sellerLevels, or footer to update' });
  }
  try {
    if (currency && currency.code && currency.symbol) {
      const value = JSON.stringify({ code: currency.code, symbol: currency.symbol });
      await prisma.siteSetting.upsert({
        where: { key: 'currency' },
        create: { key: 'currency', value },
        update: { value },
      });
    }
    if (sellerLevels && typeof sellerLevels === 'object') {
      const value = JSON.stringify(sellerLevels);
      await prisma.siteSetting.upsert({
        where: { key: 'seller_levels' },
        create: { key: 'seller_levels', value },
        update: { value },
      });
    }
    if (footer && typeof footer === 'object') {
      if (typeof footer.tagline === 'string') {
        await prisma.siteSetting.upsert({
          where: { key: 'footer_tagline' },
          create: { key: 'footer_tagline', value: footer.tagline },
          update: { value: footer.tagline },
        });
      }
      if (typeof footer.address === 'string') {
        await prisma.siteSetting.upsert({
          where: { key: 'footer_address' },
          create: { key: 'footer_address', value: footer.address },
          update: { value: footer.address },
        });
      }
      if (typeof footer.phone === 'string') {
        await prisma.siteSetting.upsert({
          where: { key: 'footer_phone' },
          create: { key: 'footer_phone', value: footer.phone },
          update: { value: footer.phone },
        });
      }
    }
    const settings = {};
    if (currency) settings.currency = currency;
    if (sellerLevels) settings.sellerLevels = sellerLevels;
    if (footer) settings.footer = footer;
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('[Settings] Update failed:', err);
    return res.status(503).json({
      success: false,
      message: err.message || 'Settings not available. Run database/add-site-settings.sql and fix-site-settings-value.sql in MySQL.',
    });
  }
};
