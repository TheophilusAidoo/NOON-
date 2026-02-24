import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireSeller } from '../middleware/role.middleware.js';
import * as seller from '../controllers/seller.controller.js';
import * as deposit from '../controllers/seller.deposit.controller.js';
import * as chat from '../controllers/chat.controller.js';
import { validate } from '../validators/index.js';
import { createProductSchema, updateProductSchema } from '../validators/product.validator.js';

const router = Router();

router.use(authenticate);
router.use(requireSeller);

router.get('/dashboard', seller.getDashboard);
router.get('/profile', seller.getProfile);
router.put('/profile', seller.updateProfile);
router.get('/level', deposit.getMyLevel);
router.get('/deposits', deposit.getMyDeposits);
router.post('/deposits', deposit.requestDeposit);
router.get('/products', seller.getMyProducts);
router.get('/wholesale-products', seller.getWholesaleProducts);
router.post('/wholesale-products/:id/resell', seller.resellFromWholesale);
router.get('/products/:id', seller.getProductById);
router.post('/products', validate(createProductSchema), seller.createProduct);
router.put('/products/:id', validate(updateProductSchema), seller.updateProduct);
router.delete('/products/:id', seller.deleteProduct);

router.get('/orders', seller.getMyOrders);
router.post('/orders/:orderId/purchase-from-admin', seller.purchaseFromAdmin);

router.get('/withdrawals', seller.getWithdrawals);
router.post('/withdrawal', seller.requestWithdrawal);

// Chat with admin
router.get('/chat/admin', chat.getSellerChatAdmin);
router.get('/chat/messages', chat.getSellerChatMessages);
router.post('/chat/messages', chat.sendSellerMessage);

export default router;
