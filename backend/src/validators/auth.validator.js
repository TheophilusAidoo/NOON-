/**
 * Joi validation schemas for auth
 */

import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('CUSTOMER', 'SELLER').default('CUSTOMER'),
  storeName: Joi.string().min(2).max(100).when('role', {
    is: 'SELLER',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  storeDescription: Joi.string().max(500).optional(),
  logo: Joi.string().max(500).when('role', {
    is: 'SELLER',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  banner: Joi.string().max(500).when('role', {
    is: 'SELLER',
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
