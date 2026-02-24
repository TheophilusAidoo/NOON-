import { Router } from 'express';
import * as banner from '../controllers/banner.controller.js';

const router = Router();

router.get('/', banner.getAll);
router.get('/sellers-page', banner.getSellersBanner);

export default router;
