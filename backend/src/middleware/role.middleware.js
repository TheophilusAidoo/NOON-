/**
 * Role-based access control middleware
 * Must be used AFTER authenticate middleware
 */

import { AppError } from './error.middleware.js';

export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(new AppError('Forbidden - insufficient permissions', 403));
  }

  // Sellers must be approved
  if (req.user.role === 'SELLER' && !req.user.isApproved) {
    return next(new AppError('Your seller account is pending approval', 403));
  }

  next();
};

export const requireAdmin = requireRole('ADMIN');
export const requireSeller = requireRole('SELLER');
export const requireCustomer = requireRole('CUSTOMER');
