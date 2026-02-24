import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { uploadMiddleware, uploadImages } from '../controllers/upload.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN', 'SELLER'));

router.post(
  '/',
  (req, res, next) => {
    uploadMiddleware.array('images', 10)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
      }
      next();
    });
  },
  uploadImages
);

export default router;
