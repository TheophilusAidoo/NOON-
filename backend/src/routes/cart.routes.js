import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as cart from '../controllers/cart.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', cart.getCart);
router.post('/', cart.addToCart);
router.put('/items/:itemId', cart.updateCartItem);
router.delete('/items/:itemId', cart.removeFromCart);

export default router;
