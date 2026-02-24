import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as payment from '../controllers/payment.controller.js';

const router = Router();

router.post('/create-payment-intent', authenticate, payment.createPaymentIntent);
router.post('/confirm-order', authenticate, payment.confirmOrderFromStripe);

export default router;
