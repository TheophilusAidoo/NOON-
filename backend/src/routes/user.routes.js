import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Placeholder - auth/me handles profile
router.get('/profile', authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

export default router;
