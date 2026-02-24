import { Router } from 'express';
import * as category from '../controllers/category.controller.js';

const router = Router();

router.get('/', category.getAll);
router.get('/:slug', category.getBySlug);

export default router;
