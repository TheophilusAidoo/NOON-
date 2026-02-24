/**
 * Admin controller - Dashboard, approve sellers, manage catalog, etc.
 */

import { prisma } from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingSellers,
      totalProducts,
      totalSellers,
      totalCategories,
      totalBrands,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.user.count({ where: { role: 'SELLER', isApproved: false } }),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'SELLER', isApproved: true } }),
      prisma.category.count(),
      prisma.brand.count(),
    ]);

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, items: true },
    });

    const now = new Date();
    const ordersByMonth = [];
    const categoryProductCount = await prisma.product.groupBy({
      by: ['categoryId'],
      _count: { id: true },
    });
    const categoryNames = await prisma.category.findMany({
      where: { id: { in: categoryProductCount.map((c) => c.categoryId) } },
      select: { id: true, name: true },
    });
    const catMap = Object.fromEntries(categoryNames.map((c) => [c.id, c.name]));
    const productsByCategory = categoryProductCount.map((c) => ({
      name: catMap[c.categoryId] || 'Unknown',
      count: c._count.id,
    }));

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const [monthOrders, monthRevenue] = await Promise.all([
        prisma.order.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.order.aggregate({
          where: { createdAt: { gte: start, lte: end }, paymentStatus: 'PAID' },
          _sum: { totalAmount: true },
        }),
      ]);
      ordersByMonth.push({
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        orders: monthOrders,
        revenue: monthRevenue._sum.totalAmount || 0,
      });
    }

    const [customers, sellersCount, admins] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingSellers,
        totalProducts,
        totalSellers,
        totalCategories,
        totalBrands,
        recentOrders,
        ordersByMonth,
        productsByCategory,
        usersByRole: [
          { name: 'Customers', value: customers },
          { name: 'Sellers', value: sellersCount },
          { name: 'Admins', value: admins },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPendingSellers = async (req, res, next) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER', isApproved: false },
      include: { sellerProfile: true },
    });
    res.json({ success: true, data: sellers });
  } catch (err) {
    next(err);
  }
};

export const getAllSellers = async (req, res, next) => {
  try {
    let sellers;
    try {
      sellers = await prisma.user.findMany({
        where: { role: 'SELLER' },
        include: {
          sellerProfile: { select: { storeName: true, storeDescription: true, logo: true, storeLevel: true, cumulativeRecharge: true, creditScore: true } },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (dbErr) {
      // Fallback if storeLevel/cumulativeRecharge columns don't exist (add-seller-levels.sql not run)
      console.warn('[getAllSellers] Full query failed, using fallback:', dbErr.message);
      sellers = await prisma.user.findMany({
        where: { role: 'SELLER' },
        include: {
          sellerProfile: { select: { storeName: true, storeDescription: true, logo: true } },
          _count: { select: { products: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      sellers = sellers.map((s) => ({
        ...s,
        sellerProfile: s.sellerProfile ? { ...s.sellerProfile, storeLevel: 'C', cumulativeRecharge: 0, creditScore: 100 } : null,
      }));
    }
    res.json({ success: true, data: sellers });
  } catch (err) {
    next(err);
  }
};

export const approveSeller = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });

    if (!user || user.role !== 'SELLER') {
      throw new AppError('Seller not found', 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    res.json({ success: true, message: 'Seller approved' });
  } catch (err) {
    next(err);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });
    if (!user || user.role !== 'SELLER') throw new AppError('Seller not found', 404);

    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: false },
    });

    res.json({ success: true, message: 'Seller suspended' });
  } catch (err) {
    next(err);
  }
};

export const updateSellerLevel = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { storeLevel } = req.body;

    const validLevels = ['C', 'B', 'A', 'S'];
    if (!storeLevel || !validLevels.includes(storeLevel)) {
      throw new AppError('Invalid level. Use C, B, A, or S', 400);
    }

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new AppError('Seller profile not found', 404);

    await prisma.sellerProfile.update({
      where: { userId },
      data: { storeLevel },
    });

    res.json({ success: true, message: `Seller level set to ${storeLevel}` });
  } catch (err) {
    next(err);
  }
};

export const updateSellerCreditScore = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { creditScore } = req.body;

    const score = Math.min(1000, Math.max(0, parseInt(creditScore, 10)));
    if (isNaN(score)) throw new AppError('Credit score must be 0-1000', 400);

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new AppError('Seller profile not found', 404);

    await prisma.sellerProfile.update({
      where: { userId },
      data: { creditScore: score },
    });

    res.json({ success: true, message: `Credit score set to ${score}` });
  } catch (err) {
    next(err);
  }
};

export const deleteSeller = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { sellerProfile: true },
    });
    if (!user || user.role !== 'SELLER') throw new AppError('Seller not found', 404);

    const orderItemCount = await prisma.orderItem.count({ where: { sellerId: userId } });
    if (orderItemCount > 0) {
      throw new AppError('Cannot delete: seller has order history. Suspend instead.', 400);
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ success: true, message: 'Seller account deleted' });
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, image, promoLabel } = req.body;
    const category = await prisma.category.create({
      data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), image, promoLabel },
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const brand = await prisma.brand.create({ data: req.body });
    res.status(201).json({ success: true, data: brand });
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    const adminIds = admins.map((a) => a.id);

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            seller: { select: { name: true, role: true, sellerProfile: { select: { storeName: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = orders.map((o) => {
      const hasSellerItems = o.items.some((i) => i.seller && !adminIds.includes(i.sellerId));
      const sellerStores = [...new Set(
        o.items
          .filter((i) => i.seller && !adminIds.includes(i.sellerId) && i.seller.sellerProfile?.storeName)
          .map((i) => i.seller.sellerProfile?.storeName)
      )].filter(Boolean);
      return { ...o, hasSellerItems, sellerStores };
    });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

const VALID_ORDER_STATUS = ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const VALID_PAYMENT_STATUS = ['PENDING', 'PAID', 'FAILED'];

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    const adminIds = admins.map((a) => a.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { include: { images: { take: 1 } } },
            seller: { select: { name: true, role: true, sellerProfile: { select: { storeName: true } } } },
          },
        },
      },
    });
    if (!order) throw new AppError('Order not found', 404);

    const hasSellerItems = order.items.some((i) => i.seller && !adminIds.includes(i.sellerId));
    res.json({ success: true, data: { ...order, hasSellerItems } });
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const data = {};
    if (orderStatus) {
      if (!VALID_ORDER_STATUS.includes(orderStatus)) {
        throw new AppError(`Invalid order status. Use: ${VALID_ORDER_STATUS.join(', ')}`, 400);
      }
      if (orderStatus === 'SHIPPED' || orderStatus === 'DELIVERED') {
        const unpaidItems = await prisma.orderItem.count({
          where: {
            orderId: id,
            wholesaleCost: { not: null },
            sellerPaidToAdmin: false,
          },
        });
        if (unpaidItems > 0) {
          throw new AppError(
            'Cannot ship: sellers must purchase their wholesale items from admin first. Check seller orders.',
            400
          );
        }
      }
      data.orderStatus = orderStatus;
    }
    if (paymentStatus !== undefined) {
      if (!VALID_PAYMENT_STATUS.includes(paymentStatus)) {
        throw new AppError(`Invalid payment status. Use: ${VALID_PAYMENT_STATUS.join(', ')}`, 400);
      }
      data.paymentStatus = paymentStatus;
    }

    if (Object.keys(data).length === 0) {
      throw new AppError('Provide orderStatus and/or paymentStatus', 400);
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id },
      select: { orderStatus: true },
    });

    const shouldCreditSellers = orderStatus === 'DELIVERED' && currentOrder?.orderStatus !== 'DELIVERED';

    if (shouldCreditSellers) {
      const paidWholesaleItems = await prisma.orderItem.findMany({
        where: {
          orderId: id,
          wholesaleCost: { not: null },
          sellerPaidToAdmin: true,
        },
        select: { sellerId: true, wholesaleCost: true },
      });

      const bySeller = new Map();
      for (const item of paidWholesaleItems) {
        const cost = item.wholesaleCost ?? 0;
        bySeller.set(item.sellerId, (bySeller.get(item.sellerId) ?? 0) + cost);
      }

      const updates = [];
      for (const [sellerId, amount] of bySeller.entries()) {
        if (amount <= 0) continue;
        updates.push(
          prisma.sellerProfile.updateMany({
            where: { userId: sellerId },
            data: { wholesaleSpend: { decrement: amount } },
          })
        );
      }
      if (updates.length > 0) {
        await prisma.$transaction(updates);
        for (const [sellerId] of bySeller.entries()) {
          const p = await prisma.sellerProfile.findUnique({
            where: { userId: sellerId },
            select: { wholesaleSpend: true },
          });
          if (p && (p.wholesaleSpend ?? 0) < 0) {
            await prisma.sellerProfile.update({
              where: { userId: sellerId },
              data: { wholesaleSpend: 0 },
            });
          }
        }
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data,
    });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

export const runExpireWholesaleOrders = async (req, res, next) => {
  try {
    const { expireWholesaleOrders } = await import('../jobs/expireWholesaleOrders.js');
    const { expiredCount } = await expireWholesaleOrders();
    res.json({ success: true, data: { expiredCount } });
  } catch (err) {
    next(err);
  }
};

export const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: coupons });
  } catch (err) {
    next(err);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.status(201).json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: coupon });
  } catch (err) {
    next(err);
  }
};

export const setFeaturedProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { isFeatured: true },
    });

    await prisma.product.updateMany({
      where: { id: { notIn: productIds } },
      data: { isFeatured: false },
    });

    res.json({ success: true, message: 'Featured products updated' });
  } catch (err) {
    next(err);
  }
};

export const getApprovedSellers = async (req, res, next) => {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER', isApproved: true },
      select: {
        id: true,
        name: true,
        email: true,
        sellerProfile: { select: { storeName: true } },
      },
    });
    res.json({ success: true, data: sellers });
  } catch (err) {
    next(err);
  }
};

export const convertToWholesale = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.product.update({
      where: { id },
      data: { sellerId: req.user.id },
    });
    res.json({ success: true, message: 'Product converted to wholesale catalog' });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { sellerId, images, variants, isWholesale, ...productData } = req.body;

    let resolvedSellerId = sellerId;
    if (isWholesale || !resolvedSellerId) {
      resolvedSellerId = req.user.id;
    } else {
      const seller = await prisma.user.findUnique({
        where: { id: resolvedSellerId, role: 'SELLER', isApproved: true },
      });
      if (!seller) {
        throw new AppError('Invalid or unapproved seller', 400);
      }
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        sellerId: resolvedSellerId,
        images: images?.length
          ? { create: images.map((url) => ({ imageUrl: url })) }
          : undefined,
        variants: variants?.length
          ? { create: variants }
          : undefined,
      },
      include: { images: true, variants: true, category: true, brand: true },
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, category: true, brand: true },
    });
    if (!product) throw new AppError('Product not found', 404);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { images, variants, ...productData } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Product not found', 404);

    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: images.map((url) => ({ productId: id, imageUrl: url })),
      });
    }

    if (variants) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      if (variants.length) {
        await prisma.productVariant.createMany({
          data: variants.map((v) => ({ ...v, productId: id })),
        });
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: productData,
      include: { images: true, variants: true, category: true, brand: true },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new AppError('Product not found', 404);

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
