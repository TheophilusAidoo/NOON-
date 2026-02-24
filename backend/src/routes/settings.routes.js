/**
 * Settings routes - public (currency, etc.)
 */

import { Router } from 'express';
import * as settings from '../controllers/settings.controller.js';

const router = Router();
router.get('/', settings.getPublicSettings);
export default router;
