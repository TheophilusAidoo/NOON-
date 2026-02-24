/**
 * Order controller - Create, list, track
 * Commission per seller based on store level profit margin
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { parseLevelsConfig, getProfitMargin } from '../utils/sellerLevels.js';
import { buildOrderItemsData } from '../utils/orderItems.js';

export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, couponCode } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { seller: true },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    let totalAmount = 0;

    for (const item of cart.items) {
      const price = item.product.discountPrice ?? item.product.price;
      totalAmount += price * item.quantity;

      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.title}`, 400);
      }
    }

    const orderItemsData = await buildOrderItemsData(prisma, cart.items);

    // Coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: couponCode, active: true, expiryDate: { gte: new Date() } },
      });
      if (coupon) {
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          throw new AppError('Coupon has reached usage limit', 400);
        }
        if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
          throw new AppError(`Minimum order amount ${coupon.minOrderAmount} required`, 400);
        }
        if (coupon.discountType === 'PERCENTAGE') {
          discount = totalAmount * (coupon.discountValue / 100);
        } else {
          discount = Math.min(coupon.discountValue, totalAmount);
        }
      }
    }
    totalAmount -= discount;

    const setting = await prisma.siteSetting.findUnique({ where: { key: 'seller_levels' } });
    const levelsConfig = parseLevelsConfig(setting?.value);

    let totalCommission = 0;
    const sellerIds = [...new Set(orderItemsData.map((i) => i.sellerId))];
    const profiles = await prisma.sellerProfile.findMany({
      where: { userId: { in: sellerIds } },
    });
    const profileMap = Object.fromEntries(profiles.map((p) => [p.userId, p]));

    for (const item of orderItemsData) {
      const profile = profileMap[item.sellerId];
      const margin = getProfitMargin(levelsConfig, profile?.storeLevel || 'C');
      totalCommission += item.price * item.quantity * (1 - margin);
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalAmount,
        shippingAddress,
        adminCommission: totalCommission,
        couponCode: couponCode || null,
        items: {
          create: orderItemsData,
        },
      },
      include: { items: { include: { product: true } } },
    });

    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode },
        data: { usageCount: { increment: 1 } },
      });
    }

    // Decrement stock
    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({
      success: true,
      message: 'Order created',
      data: order,
    });
  } catch (err) {
    next(err);
  }
};

/** Get user's most recent shipping address for checkout pre-fill */
export const getLastShippingAddress = async (req, res, next) => {
  try {
    const last = await prisma.order.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { shippingAddress: true },
    });
    let address = last?.shippingAddress || null;
    if (address && typeof address === 'string' && address.startsWith('{')) {
      try {
        const parsed = JSON.parse(address);
        address = parsed.line1 || parsed.line2 || parsed.address || address;
      } catch {
        // keep as-is
      }
    }
    res.json({ success: true, data: { defaultAddress: address } });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: { include: { product: { include: { images: { take: 1 } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { images: true } } } },
      },
    });

    if (!order || order.userId !== req.user.id) {
      throw new AppError('Order not found', 404);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
