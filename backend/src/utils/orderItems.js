/**
 * Build order items with wholesale cost and seller fulfillment status
 * Wholesale-resold products: seller must pay admin (wholesaleCost) before admin can ship
 * Seller gets profit margin based on level
 */

import { parseLevelsConfig, getProfitMargin } from './sellerLevels.js';

export async function buildOrderItemsData(prisma, cartItems) {
  const setting = await prisma.siteSetting.findUnique({ where: { key: 'seller_levels' } });
  const levelsConfig = parseLevelsConfig(setting?.value);

  const sellerIds = [...new Set(cartItems.map((i) => i.product.sellerId))];
  const profiles = await prisma.sellerProfile.findMany({
    where: { userId: { in: sellerIds } },
  });
  const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]));

  const items = [];
  for (const item of cartItems) {
    const price = item.product.discountPrice ?? item.product.price;
    const subtotal = price * item.quantity;
    const isWholesale = item.product.sku?.startsWith?.('WS-');
    const profile = profileMap[item.product.sellerId];
    const margin = getProfitMargin(levelsConfig, profile?.storeLevel || 'C');

    const base = {
      productId: item.productId,
      sellerId: item.product.sellerId,
      quantity: item.quantity,
      price,
    };

    if (isWholesale) {
      const wholesaleCost = subtotal * (1 - margin);
      items.push({
        ...base,
        wholesaleCost,
        sellerPaidToAdmin: false,
      });
    } else {
      items.push({
        ...base,
        wholesaleCost: null,
        sellerPaidToAdmin: true,
      });
    }
  }
  return items;
}
