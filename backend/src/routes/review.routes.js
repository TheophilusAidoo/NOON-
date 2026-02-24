import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as review from '../controllers/review.controller.js';

const router = Router();

router.get('/product/:productId', review.getProductReviews);
router.post('/', authenticate, review.createReview);

export default router;
