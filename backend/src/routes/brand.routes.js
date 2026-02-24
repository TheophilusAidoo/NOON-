import { Router } from 'express';
import * as brand from '../controllers/brand.controller.js';

const router = Router();

router.get('/', brand.getAll);

export default router;
