/**
 * Newsletter routes - public subscribe (no auth)
 */

import { Router } from 'express';
import * as newsletter from '../controllers/newsletter.controller.js';

const router = Router();
router.post('/subscribe', newsletter.subscribe);
export default router;
