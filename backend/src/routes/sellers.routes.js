/**
 * Public sellers routes - no auth required
 */

import { Router } from 'express';
import * as sellers from '../controllers/sellers.controller.js';

const router = Router();

router.get('/', sellers.getAllSellers);
router.get('/:id/products', sellers.getSellerProducts); // Must be before /:id
router.get('/:id', sellers.getSellerById);

export default router;
