/**
 * Express app (exportable for Vercel serverless).
 * Used by index.js for local dev and by Vercel for deployment.
 */

import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import brandRoutes from './routes/brand.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import reviewRoutes from './routes/review.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import adminRoutes from './routes/admin.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import sellersPublicRoutes from './routes/sellers.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentMethodsRoutes from './routes/payment-methods.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import * as paymentController from './controllers/payment.controller.js';
import { expireWholesaleOrders } from './jobs/expireWholesaleOrders.js';

import fs from 'fs';

const isVercel = !!process.env.VERCEL;
const isDev = process.env.NODE_ENV !== 'production';

// Ensure uploads directory exists (only for non-Vercel)
if (!isVercel) {
  const uploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(limiter);

app.use(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

app.use(express.json());

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/sellers', sellersPublicRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);

// Serve uploads (local only; Vercel uses Blob URLs)
if (!isVercel) {
  app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), vercel: isVercel }));

// Cron endpoint for Vercel (expire wholesale orders)
app.get('/api/cron/expire-wholesale', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers['authorization'] !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { expiredCount } = await expireWholesaleOrders();
    res.json({ success: true, expiredCount });
  } catch (err) {
    console.error('[cron] expireWholesaleOrders:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use(errorHandler);

export default app;
