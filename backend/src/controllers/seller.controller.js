/**
 * Seller controller - Products, orders, analytics
 */

import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { parseLevelsConfig, getProductLimit, getLevelForRecharge } from '../utils/sellerLevels.js';

const requireDepositForListing = async (userId) => {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
    select: { cumulativeRecharge: true, storeLevel: true },
  });
  const cumulativeRecharge = profile?.cumulativeRecharge ?? 0;
  if (cumulativeRecharge <= 0) {
    throw new AppError(
      'You must make a deposit to list or resell products. Deposit to unlock your store level.',
      403
    );
  }
};

const getSellerProductLimit = async (userId) => {
  const [profile, setting] = await Promise.all([
    prisma.sellerProfile.findUnique({ where: { userId }, select: { cumulativeRecharge: true, storeLevel: true } }),
    prisma.siteSetting.findUnique({ where: { key: 'seller_levels' } }),
  ]);
  const levelsConfig = parseLevelsConfig(setting?.value);
  const cumulativeRecharge = profile?.cumulativeRecharge ?? 0;
  const effectiveLevel = getLevelForRecharge(levelsConfig, cumulativeRecharge);
  return { limit: getProductLimit(levelsConfig, effectiveLevel), level: effectiveLevel };
};

const ensureSellerOwnsProduct = async (productId, sellerId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });
  if (!product || product.sellerId !== sellerId) {
    throw new AppError('Product not found or access denied', 404);
  }
  return product;
};

export const getProfile = async (req, res, next) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      select: { storeName: true, storeDescription: true, logo: true, banner: true, cryptoWalletAddress: true, cryptoName: true },
    });
    if (!profile) throw new AppError('Seller profile not found', 404);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { storeName, storeDescription, logo, banner, cryptoWalletAddress, cryptoName } = req.body;
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) {
      throw new AppError('Seller profile not found', 404);
    }
    const updated = await prisma.sellerProfile.update({
      where: { userId: req.user.id },
      data: {
        ...(storeName != null && { storeName }),
        ...(storeDescription != null && { storeDescription }),
        ...(logo != null && { logo }),
        ...(banner != null && { banner }),
        ...(cryptoWalletAddress !== undefined && { cryptoWalletAddress: cryptoWalletAddress || null }),
        ...(cryptoName !== undefined && { cryptoName: cryptoName || null }),
      },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const [products, orders, totalRevenue, recentOrderItems, orderItemsForCharts, paidWholesaleItems] = await Promise.all([
      prisma.product.count({ where: { sellerId: req.user.id } }),
      prisma.orderItem.count({
        where: {
          sellerId: req.user.id,
          order: { paymentStatus: 'PAID' },
        },
      }),
      prisma.orderItem.aggregate({
        where: { sellerId: req.user.id, order: { paymentStatus: 'PAID' } },
        _sum: { price: true },
      }),
      prisma.orderItem.findMany({
        where: { sellerId: req.user.id },
        take: 10,
        include: {
          order: { include: { user: { select: { name: true } } } },
          product: { select: { title: true } },
        },
        orderBy: { order: { createdAt: 'desc' } },
      }),
      prisma.orderItem.findMany({
        where: { sellerId: req.user.id },
        select: {
          price: true,
          quantity: true,
          order: { select: { createdAt: true, paymentStatus: true, orderStatus: true } },
          product: { select: { category: { select: { name: true } } } },
        },
      }),
      prisma.orderItem.findMany({
        where: {
          sellerId: req.user.id,
          wholesaleCost: { not: null },
          sellerPaidToAdmin: true,
        },
        select: { price: true, quantity: true, wholesaleCost: true },
      }),
    ]);

    const accumulatedProfit = paidWholesaleItems.reduce(
      (sum, i) => sum + (i.price * i.quantity - (i.wholesaleCost ?? 0)),
      0
    );

    const now = new Date();
    const ordersByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const paidItems = orderItemsForCharts.filter(
        (oi) => oi.order.paymentStatus === 'PAID' && oi.order.createdAt >= start && oi.order.createdAt <= end
      );
      ordersByMonth.push({
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        orders: paidItems.length,
        revenue: paidItems.reduce((s, oi) => s + oi.price * (oi.quantity || 1), 0),
      });
    }

    const categoryMap = {};
    orderItemsForCharts
      .filter((oi) => oi.order.paymentStatus === 'PAID')
      .forEach((oi) => {
        const name = oi.product?.category?.name || 'Other';
        const amount = oi.price * (oi.quantity || 1);
        categoryMap[name] = (categoryMap[name] || 0) + amount;
      });
    const salesByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    const statusMap = {};
    orderItemsForCharts.forEach((oi) => {
      const s = oi.order?.orderStatus || 'PROCESSING';
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const ordersByStatus = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

    res.json({
      success: true,
      data: {
        totalProducts: products,
        totalOrders: orders,
        totalRevenue: totalRevenue._sum?.price || 0,
        accumulatedProfit,
        recentOrders: recentOrderItems,
        creditScore: profile?.creditScore ?? 100,
        storeLevel: profile?.storeLevel ?? 'C',
        cumulativeRecharge: profile?.cumulativeRecharge ?? 0,
        ordersByMonth,
        salesByCategory,
        ordersByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await ensureSellerOwnsProduct(req.params.id, req.user.id);
    const full = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true, variants: true, category: true, brand: true },
    });
    res.json({ success: true, data: full });
  } catch (err) {
    next(err);
  }
};

export const getMyProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      include: {
        images: { take: 1 },
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

export const resellFromWholesale = async (req, res, next) => {
  try {
    await requireDepositForListing(req.user.id);

    const { id } = req.params;
    const { price, stock } = req.body;
    const myPrice = parseFloat(price);
    const myStock = parseInt(stock, 10) || 1;
    if (isNaN(myPrice) || myPrice <= 0) throw new AppError('Enter a valid retail price', 400);

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    const adminIds = admins.map((a) => a.id);
    const wholesale = await prisma.product.findFirst({
      where: { id, sellerId: { in: adminIds } },
      include: { images: true },
    });
    if (!wholesale) throw new AppError('Wholesale product not found', 404);

    const { limit, level } = await getSellerProductLimit(req.user.id);
    const count = await prisma.product.count({ where: { sellerId: req.user.id } });
    if (count >= limit) {
      throw new AppError(
        `Product limit reached (${limit} for Level ${level}). Deposit to upgrade your store level.`,
        400
      );
    }

    const product = await prisma.product.create({
      data: {
        title: wholesale.title,
        description: wholesale.description,
        price: myPrice,
        categoryId: wholesale.categoryId,
        brandId: wholesale.brandId,
        stock: myStock,
        sellerId: req.user.id,
        sku: `WS-${wholesale.id}-${req.user.id}-${Date.now()}`,
        images: {
          create: wholesale.images.map((img) => ({ imageUrl: img.imageUrl })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getWholesaleProducts = async (req, res, next) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    const adminIds = admins.map((a) => a.id);

    const [products, resoldProducts] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId: { in: adminIds } },
        include: {
          images: { take: 1 },
          category: { select: { name: true } },
          brand: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.findMany({
        where: { sellerId: req.user.id, sku: { startsWith: 'WS-' } },
        select: { sku: true },
      }),
    ]);

    const resoldWholesaleIds = new Set(
      resoldProducts
        .map((p) => p.sku?.split('-')[1])
        .filter(Boolean)
    );
    const available = products.filter((p) => !resoldWholesaleIds.has(p.id));

    res.json({ success: true, data: available });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    await requireDepositForListing(req.user.id);

    const { images, variants, ...productData } = req.body;

    const { limit, level } = await getSellerProductLimit(req.user.id);
    const count = await prisma.product.count({ where: { sellerId: req.user.id } });
    if (count >= limit) {
      throw new AppError(
        `Product limit reached (${limit} for Level ${level}). Deposit to upgrade your store level.`,
        400
      );
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        sellerId: req.user.id,
        images: images?.length
          ? { create: images.map((url) => ({ imageUrl: url })) }
          : undefined,
        variants: variants?.length
          ? { create: variants }
          : undefined,
      },
      include: { images: true, variants: true },
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

const isWholesaleResoldProduct = (product) => product?.sku?.startsWith('WS-');

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await ensureSellerOwnsProduct(id, req.user.id);

    const { images, variants, ...productData } = req.body;

    if (isWholesaleResoldProduct(product)) {
      delete productData.price;
      delete productData.discountPrice;
      delete productData.sku;
    }

    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((url) => ({ productId: id, imageUrl: url })),
      });
    }

    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.productVariant.createMany({
        data: variants.map((v) => ({ ...v, productId: id })),
      });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: productData,
      include: { images: true, variants: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await ensureSellerOwnsProduct(id, req.user.id);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const items = await prisma.orderItem.findMany({
      where: { sellerId: req.user.id },
      include: {
        order: {
          select: {
            id: true,
            orderStatus: true,
            paymentStatus: true,
            createdAt: true,
            shippingAddress: true,
            user: { select: { name: true, email: true } },
          },
        },
        product: { include: { images: { take: 1 } } },
      },
      orderBy: { order: { createdAt: 'desc' } },
    });

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

export const purchaseFromAdmin = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          where: { sellerId: req.user.id, wholesaleCost: { not: null }, sellerPaidToAdmin: false },
          include: { product: true },
        },
      },
    });
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    if (order.items.length === 0) {
      throw new AppError('No wholesale items to purchase for this order', 400);
    }

    const totalCost = order.items.reduce((sum, i) => sum + (i.wholesaleCost || 0), 0);
    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });
    const availableBalance = (profile?.cumulativeRecharge ?? 0) - (profile?.wholesaleSpend ?? 0);
    if (availableBalance < totalCost) {
      throw new AppError(
        `Insufficient balance. Need ${totalCost.toFixed(2)}, available ${availableBalance.toFixed(2)}. Deposit to continue.`,
        400
      );
    }

    await prisma.$transaction([
      prisma.sellerProfile.update({
        where: { userId: req.user.id },
        data: { wholesaleSpend: { increment: totalCost } },
      }),
      prisma.orderItem.updateMany({
        where: {
          orderId,
          sellerId: req.user.id,
          wholesaleCost: { not: null },
        },
        data: { sellerPaidToAdmin: true },
      }),
    ]);

    res.json({
      success: true,
      message: `Purchased from admin. Your profit margin applies.`,
      data: { amountPaid: totalCost },
    });
  } catch (err) {
    next(err);
  }
};

export const getWithdrawals = async (req, res, next) => {
  try {
    const [totalEarnings, totalWithdrawn, withdrawals, profile] = await Promise.all([
      prisma.orderItem.aggregate({
        where: { sellerId: req.user.id, order: { paymentStatus: 'PAID' } },
        _sum: { price: true },
      }),
      prisma.withdrawalRequest.aggregate({
        where: { sellerId: req.user.id, status: 'approved' },
        _sum: { amount: true },
      }),
      prisma.withdrawalRequest.findMany({
        where: { sellerId: req.user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sellerProfile.findUnique({
        where: { userId: req.user.id },
        select: { cryptoWalletAddress: true, cryptoName: true },
      }),
    ]);

    const available = (totalEarnings._sum?.price || 0) - (totalWithdrawn._sum?.amount || 0);

    res.json({
      success: true,
      data: {
        availableBalance: available,
        totalEarnings: totalEarnings._sum?.price || 0,
        totalWithdrawn: totalWithdrawn._sum?.amount || 0,
        withdrawals,
        walletAddress: profile?.cryptoWalletAddress ?? '',
        cryptoName: profile?.cryptoName ?? '',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount, password } = req.body;

    if (!password || typeof password !== 'string') {
      throw new AppError('Password is required to confirm withdrawal', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });
    if (!user) throw new AppError('User not found', 404);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new AppError('Invalid password', 401);
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      select: { cryptoWalletAddress: true, cryptoName: true },
    });
    if (!profile) throw new AppError('Seller profile not found', 404);
    const walletAddress = (profile.cryptoWalletAddress || '').trim();
    const cryptoName = (profile.cryptoName || '').trim();
    if (!walletAddress || !cryptoName) {
      throw new AppError(
        'Set your crypto wallet address and crypto name in the Withdrawals section before requesting a withdrawal.',
        400
      );
    }

    const totalEarnings = await prisma.orderItem.aggregate({
      where: { sellerId: req.user.id, order: { paymentStatus: 'PAID' } },
      _sum: { price: true },
    });

    const totalWithdrawn = await prisma.withdrawalRequest.aggregate({
      where: { sellerId: req.user.id, status: 'approved' },
      _sum: { amount: true },
    });

    const available = (totalEarnings._sum?.price || 0) - (totalWithdrawn._sum?.amount || 0);

    if (amount > available || amount <= 0) {
      throw new AppError(`Invalid amount. Available: ${available}`, 400);
    }

    await prisma.withdrawalRequest.create({
      data: {
        sellerId: req.user.id,
        amount,
        walletAddress,
        cryptoName,
      },
    });

    res.status(201).json({ success: true, message: 'Withdrawal request submitted' });
  } catch (err) {
    next(err);
  }
};
