/**
 * Rakuten - Multi-Vendor E-commerce Backend
 * Express.js + Prisma + MySQL + Socket.io
 */

import 'dotenv/config';

// Prevent crashes from unhandled errors - log instead of exit
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message);
});
process.on('unhandledRejection', (reason, p) => {
  console.error('[unhandledRejection]', reason);
});
import http from 'http';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

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
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

import { errorHandler } from './middleware/error.middleware.js';
import * as paymentController from './controllers/payment.controller.js';
import { setupSocket } from './socket.js';

const app = express();
const server = http.createServer(app);
let PORT = parseInt(process.env.PORT, 10) || 5001;

// Rate limiting - relaxed in development (all requests proxy through Next.js = same IP)
const isDev = process.env.NODE_ENV !== 'production';
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
  origin: true, // Allow any origin in development (reflects request origin)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(limiter);

// Stripe webhook - requires raw body (must be before express.json)
app.use(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook
);

app.use(express.json());

// Routes
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

app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

setupSocket(server);

// Expire orders where seller did not purchase wholesale within 48h (run on startup + hourly)
import { expireWholesaleOrders } from './jobs/expireWholesaleOrders.js';
const runExpireJob = async () => {
  try {
    const { expiredCount } = await expireWholesaleOrders();
    if (expiredCount > 0) console.log(`[job] Expired ${expiredCount} wholesale order(s)`);
  } catch (err) {
    console.error('[job] expireWholesaleOrders failed:', err.message);
  }
};
runExpireJob();
setInterval(runExpireJob, 60 * 60 * 1000);

function startServer(port) {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`   API: http://localhost:${port}/api`);
    console.log(`   Socket.io: enabled for real-time chat`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${port} in use. Run: npm run kill-port\n`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}
startServer(PORT);
