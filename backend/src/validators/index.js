/**
 * Validation middleware - runs Joi schema and attaches validated data to req.body
 */

import { AppError } from '../middleware/error.middleware.js';

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new AppError(message, 400));
  }

  req.body = value;
  next();
};
