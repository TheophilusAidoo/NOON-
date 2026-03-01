/**
 * Image upload controller - for product images
 * Local: disk storage. Vercel: memory + Blob storage.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { AppError } from '../middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const isVercel = !!process.env.VERCEL;

// Local: disk. Vercel: memory (for Blob upload)
const storage = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
      filename: (_req, file, cb) => {
        const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
        const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`);
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

    if (isVercel) {
      // Vercel: upload to Blob storage
      const { put } = await import('@vercel/blob');
      const urls = [];
      for (const f of files) {
        const ext = (path.extname(f.originalname) || '.jpg').toLowerCase();
        const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
        const pathname = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;
        const blob = await put(pathname, f.buffer, { access: 'public' });
        urls.push(blob.url);
      }
      return res.json({ success: true, urls });
    }

    // Local: return relative paths
    const urls = files.map((f) => `/api/uploads/${f.filename}`);
    res.json({ success: true, urls });
  } catch (err) {
    next(err);
  }
};
