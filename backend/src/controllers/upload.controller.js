/**
 * Image upload controller - for product images
 */

import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { AppError } from '../middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
    cb(null, name);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, GIF, WebP images allowed', 400));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB

export const uploadImages = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      throw new AppError('No images uploaded', 400);
    }
    const urls = files.map((f) => `/api/uploads/${f.filename}`);
    res.json({ success: true, urls });
  } catch (err) {
    next(err);
  }
};
