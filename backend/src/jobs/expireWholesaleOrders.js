/**
 * Expire orders where seller did not purchase wholesale from admin within 48 hours.
 * Sets order to CANCELLED and deducts 10 from each affected seller's credit score.
 */

import { prisma } from '../config/db.js';

const WHOLESALE_PURCHASE_DEADLINE_HOURS = 48;
const CREDIT_SCORE_PENALTY = 10;

export async function expireWholesaleOrders() {
  const deadline = new Date(Date.now() - WHOLESALE_PURCHASE_DEADLINE_HOURS * 60 * 60 * 1000);

  // Orders: PAID, PROCESSING, older than 48h, with unpaid wholesale items
  const ordersToExpire = await prisma.order.findMany({
    where: {
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      createdAt: { lt: deadline },
      items: {
        some: {
          wholesaleCost: { not: null },
          sellerPaidToAdmin: false,
        },
      },
    },
    include: {
      items: {
        where: {
          wholesaleCost: { not: null },
          sellerPaidToAdmin: false,
        },
        select: { sellerId: true },
      },
    },
  });

  let expiredCount = 0;

  for (const order of ordersToExpire) {
    const sellerIds = [...new Set(order.items.map((i) => i.sellerId))];

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { orderStatus: 'CANCELLED' },
      }),
      ...sellerIds.map((sellerId) =>
        prisma.sellerProfile.updateMany({
          where: { userId: sellerId },
          data: {
            creditScore: {
              decrement: CREDIT_SCORE_PENALTY,
            },
          },
        })
      ),
    ]);

    // Floor credit score at 0
    await prisma.sellerProfile.updateMany({
      where: { userId: { in: sellerIds }, creditScore: { lt: 0 } },
      data: { creditScore: 0 },
    });

    expiredCount += 1;
  }

  return { expiredCount };
}
