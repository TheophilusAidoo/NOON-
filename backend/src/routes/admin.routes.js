import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import * as admin from '../controllers/admin.controller.js';
import * as bannerAdmin from '../controllers/admin.banner.controller.js';
import * as depositAdmin from '../controllers/admin.deposit.controller.js';
import * as withdrawalAdmin from '../controllers/admin.withdrawal.controller.js';
import * as settings from '../controllers/settings.controller.js';
import * as chat from '../controllers/chat.controller.js';
import * as manualPayment from '../controllers/manual-payment.controller.js';
import * as newsletter from '../controllers/newsletter.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', admin.getDashboardStats);
router.get('/sellers', admin.getAllSellers);
router.get('/sellers/pending', admin.getPendingSellers);
router.put('/sellers/:userId/approve', admin.approveSeller);
router.put('/sellers/:userId/suspend', admin.suspendUser);
router.put('/sellers/:userId/level', admin.updateSellerLevel);
router.put('/sellers/:userId/credit-score', admin.updateSellerCreditScore);
router.delete('/sellers/:userId', admin.deleteSeller);

router.post('/categories', admin.createCategory);
router.put('/categories/:id', admin.updateCategory);

router.post('/brands', admin.createBrand);

router.get('/orders', admin.getAllOrders);
router.get('/orders/:id', admin.getOrderById);
router.put('/orders/:id/status', admin.updateOrderStatus);
router.post('/jobs/expire-wholesale-orders', admin.runExpireWholesaleOrders);

router.get('/coupons', admin.getAllCoupons);
router.post('/coupons', admin.createCoupon);
router.put('/coupons/:id', admin.updateCoupon);

router.put('/featured-products', admin.setFeaturedProducts);

router.get('/sellers/approved', admin.getApprovedSellers);
router.get('/products/:id', admin.getProductById);
router.post('/products', admin.createProduct);
router.put('/products/:id/convert-to-wholesale', admin.convertToWholesale);
router.put('/products/:id', admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);

router.get('/banners', bannerAdmin.getAll);
router.get('/banners/sellers-page', bannerAdmin.getSellersBanner);
router.put('/banners/sellers-page', bannerAdmin.updateSellersBanner);
router.post('/banners', bannerAdmin.create);
router.put('/banners/:id', bannerAdmin.update);
router.delete('/banners/:id', bannerAdmin.remove);

router.get('/settings', settings.getSettings);
router.put('/settings', settings.updateSettings);

router.get('/newsletter-subscribers', newsletter.adminList);

router.get('/deposits/pending', depositAdmin.getPendingDeposits);
router.get('/deposits/history', depositAdmin.getDepositHistory);
router.put('/deposits/:id/approve', depositAdmin.approveDeposit);

router.get('/withdrawals', withdrawalAdmin.getWithdrawals);
router.put('/withdrawals/:id/status', withdrawalAdmin.updateWithdrawalStatus);

// Manual payment methods (crypto, wallet, QR)
router.get('/payment-methods', manualPayment.adminList);
router.post('/payment-methods', manualPayment.adminCreate);
router.put('/payment-methods/:id', manualPayment.adminUpdate);
router.delete('/payment-methods/:id', manualPayment.adminDelete);

// Chat with sellers
router.get('/chat/sellers', chat.getAdminChatSellers);
router.get('/chat/messages/:sellerId', chat.getAdminChatMessages);
router.post('/chat/messages/:sellerId', chat.sendAdminMessage);

export default router;
