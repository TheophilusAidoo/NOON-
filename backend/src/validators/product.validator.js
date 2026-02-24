/**
 * Joi validation schemas for products
 */

import Joi from 'joi';

export const createProductSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  discountPrice: Joi.number().positive().min(0).optional(),
  stock: Joi.number().integer().min(0).required(),
  sku: Joi.string().optional(),
  categoryId: Joi.string().required(),
  brandId: Joi.string().required(),
  isFeatured: Joi.boolean().optional(),
  images: Joi.array()
    .items(Joi.string().min(1))
    .min(1)
    .required(),
  variants: Joi.array()
    .items(
      Joi.object({
        variantType: Joi.string().valid('size', 'color').required(),
        variantValue: Joi.string().required(),
        stock: Joi.number().integer().min(0).required(),
      })
    )
    .optional(),
});

export const updateProductSchema = createProductSchema.keys({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  discountPrice: Joi.number().positive().min(0).optional(),
  stock: Joi.number().integer().min(0).optional(),
  categoryId: Joi.string().optional(),
  brandId: Joi.string().optional(),
  isFeatured: Joi.boolean().optional(),
  images: Joi.array().items(Joi.string().min(1)).optional(),
});
