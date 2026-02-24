/**
 * Public payment methods - for checkout (no auth)
 */

import { Router } from 'express';
import { publicList } from '../controllers/manual-payment.controller.js';

const router = Router();
router.get('/', publicList);
export default router;
