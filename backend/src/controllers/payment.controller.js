/**
 * Stripe payment controller
 */

import Stripe from 'stripe';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { buildOrderItemsData } from '../utils/orderItems.js';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const COMMISSION_RATE = parseFloat(process.env.ADMIN_COMMISSION_RATE || '0.1');

export const createPaymentIntent = async (req, res, next) => {
  try {
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    const { shippingAddress, couponCode } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${item.product.title}`, 400);
      }
      const price = item.product.discountPrice ?? item.product.price;
      totalAmount += price * item.quantity;
    }

    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          active: true,
          expiryDate: { gte: new Date() },
        },
      });
      if (coupon) {
        if (coupon.minOrderAmount && totalAmount < coupon.minOrderAmount) {
          throw new AppError(`Minimum order ${coupon.minOrderAmount} required`, 400);
        }
        if (coupon.discountType === 'PERCENTAGE') {
          totalAmount -= totalAmount * (coupon.discountValue / 100);
        } else {
          totalAmount -= Math.min(coupon.discountValue, totalAmount);
        }
      }
    }

    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        shippingAddress: JSON.stringify(shippingAddress),
        couponCode: couponCode || '',
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
    });
  } catch (err) {
    next(err);
  }
};

// Webhook handler - update order payment status
export const handleWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(500).send('Stripe not configured');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const { userId, shippingAddress, couponCode } = intent.metadata;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (cart && cart.items.length > 0) {
      let totalAmount = 0;
      for (const item of cart.items) {
        const price = item.product.discountPrice ?? item.product.price;
        totalAmount += price * item.quantity;
      }
      const orderItemsData = await buildOrderItemsData(prisma, cart.items);
      const commission = totalAmount * COMMISSION_RATE;

      await prisma.order.create({
        data: {
          userId,
          totalAmount,
          shippingAddress: shippingAddress || '{}',
          adminCommission: commission,
          stripePaymentId: intent.id,
          paymentStatus: 'PAID',
          couponCode: couponCode || null,
          items: { create: orderItemsData },
        },
      });

      for (const item of cart.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

      if (couponCode) {
        await prisma.coupon.updateMany({
          where: { code: couponCode },
          data: { usageCount: { increment: 1 } },
        });
      }
    }
  }

  res.json({ received: true });
};

/** Create order after Stripe redirect (when webhook hasn't fired, e.g. localhost dev) */
export const confirmOrderFromStripe = async (req, res, next) => {
  try {
    if (!stripe) {
      throw new AppError('Stripe not configured', 500);
    }

    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      throw new AppError('Payment intent ID required', 400);
    }

    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== 'succeeded') {
      throw new AppError('Payment not completed', 400);
    }

    if (intent.metadata.userId !== req.user.id) {
      throw new AppError('Invalid payment', 403);
    }

    const existing = await prisma.order.findFirst({
      where: { stripePaymentId: intent.id },
    });
    if (existing) {
      return res.json({ success: true, data: existing, alreadyCreated: true });
    }

    const { userId, shippingAddress, couponCode } = intent.metadata;
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart already processed or empty', 400);
    }

    let totalAmount = 0;
    for (const item of cart.items) {
      const price = item.product.discountPrice ?? item.product.price;
      totalAmount += price * item.quantity;
    }
    const orderItemsData = await buildOrderItemsData(prisma, cart.items);
    const commission = totalAmount * COMMISSION_RATE;

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddress: shippingAddress || '{}',
        adminCommission: commission,
        stripePaymentId: intent.id,
        paymentStatus: 'PAID',
        couponCode: couponCode || null,
        items: { create: orderItemsData },
      },
      include: { user: { select: { name: true, email: true } }, items: true },
    });

    for (const item of cart.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    if (couponCode) {
      await prisma.coupon.updateMany({
        where: { code: couponCode },
        data: { usageCount: { increment: 1 } },
      });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};
