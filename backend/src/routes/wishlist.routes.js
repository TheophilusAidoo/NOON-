import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as wishlist from '../controllers/wishlist.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', wishlist.getWishlist);
router.post('/', wishlist.addToWishlist);
router.delete('/:productId', wishlist.removeFromWishlist);

export default router;
