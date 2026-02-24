import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.middleware.js';
import * as product from '../controllers/product.controller.js';

const router = Router();

router.get('/', optionalAuth, product.getAllProducts);
router.get('/featured', product.getFeaturedProducts);
router.get('/flash-deals', product.getFlashDeals);
router.get('/seller-products', product.getSellerProducts);
router.get('/:id', product.getProductById);

export default router;
