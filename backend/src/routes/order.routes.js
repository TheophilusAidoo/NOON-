import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as order from '../controllers/order.controller.js';

const router = Router();

router.use(authenticate);
// Allow CUSTOMER, SELLER, ADMIN to place and view orders (sellers/admins can shop too)
router.use(requireRole('CUSTOMER', 'SELLER', 'ADMIN'));

router.get('/last-address', order.getLastShippingAddress);
router.get('/', order.getMyOrders);
router.get('/:id', order.getOrderById);
router.post('/', order.createOrder);

export default router;
