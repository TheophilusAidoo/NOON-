/**
 * Seller store levels - configurable via site_settings
 * Levels: C, B, A, S
 */

const DEFAULT_LEVELS = {
  C: { rechargeRequired: 1000, productLimit: 20, profitMargin: 15 },
  B: { rechargeRequired: 10000, productLimit: 50, profitMargin: 20 },
  A: { rechargeRequired: 50000, productLimit: 100, profitMargin: 25 },
  S: { rechargeRequired: 100000, productLimit: 200, profitMargin: 30 },
};

export function getDefaultLevels() {
  return { ...DEFAULT_LEVELS };
}

export function parseLevelsConfig(value) {
  if (!value) return DEFAULT_LEVELS;
  try {
    const parsed = JSON.parse(value);
    return { ...DEFAULT_LEVELS, ...parsed };
  } catch {
    return DEFAULT_LEVELS;
  }
}

export function getLevelForRecharge(levelsConfig, cumulativeRecharge) {
  let best = 'C';
  const order = ['C', 'B', 'A', 'S'];
  for (const lvl of order) {
    const cfg = levelsConfig[lvl];
    if (cfg && cumulativeRecharge >= cfg.rechargeRequired) {
      best = lvl;
    }
  }
  return best;
}

export function getProductLimit(levelsConfig, storeLevel) {
  const cfg = levelsConfig[storeLevel] || levelsConfig.C;
  return cfg?.productLimit ?? 20;
}

export function getProfitMargin(levelsConfig, storeLevel) {
  const cfg = levelsConfig[storeLevel] || levelsConfig.C;
  return (cfg?.profitMargin ?? 15) / 100;
}
