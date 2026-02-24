import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../validators/index.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { uploadMiddleware } from '../controllers/upload.controller.js';

const router = Router();

const registerUpload = uploadMiddleware.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
]);

router.post('/register', registerUpload, (req, res, next) => {
  if (req.files) {
    if (req.files.logo?.[0]) req.body.logo = `/api/uploads/${req.files.logo[0].filename}`;
    if (req.files.banner?.[0]) req.body.banner = `/api/uploads/${req.files.banner[0].filename}`;
  }
  next();
}, validate(registerSchema), auth.register);
router.post('/login', validate(loginSchema), auth.login);
router.post('/logout', auth.logout);
router.post('/refresh', auth.refresh);
router.get('/me', authenticate, auth.me);
router.get('/debug-admin', auth.debugAdmin);

export default router;
