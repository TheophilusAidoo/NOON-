/**
 * Cart controller - Add, update, remove, get cart
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }
  return cart;
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          include: {
            images: { take: 1 },
            category: { select: { name: true } },
          },
        },
      },
    });

    let total = 0;
    const enriched = items.map((item) => {
      const price = item.product.discountPrice ?? item.product.price;
      const subtotal = price * item.quantity;
      total += subtotal;
      return {
        ...item,
        subtotal,
        effectivePrice: price,
      };
    });

    res.json({
      success: true,
      data: {
        items: enriched,
        total,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} available`, 400);
    }

    const cart = await getOrCreateCart(req.user.id);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) {
        throw new AppError(`Only ${product.stock} available`, 400);
      }
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: { include: { images: { take: 1 } } } },
    });

    res.status(201).json({
      success: true,
      message: 'Added to cart',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      throw new AppError('Cart item not found', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return res.json({ success: true, message: 'Item removed' });
    }

    if (item.product.stock < quantity) {
      throw new AppError(`Only ${item.product.stock} available`, 400);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    next(err);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== req.user.id) {
      throw new AppError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};
