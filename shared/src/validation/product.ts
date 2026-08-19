import { z } from 'zod';

// ============================================================
// Product Validation
// ============================================================

export const productCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z.string().max(50).optional(),
  category_id: z.string().uuid().optional(),
  unit_id: z.string().uuid().optional(),
  cost_price: z.number().min(0, 'Cost price must be ≥ 0'),
  selling_price: z.number().min(0, 'Selling price must be ≥ 0'),
  wholesale_price: z.number().min(0).optional(),
  minimum_stock: z.number().min(0).default(0),
  description: z.string().max(1000).optional(),
  image_url: z.string().url().optional(),
});

export const productUpdateSchema = productCreateSchema
  .omit({ company_id: true })
  .partial()
  .extend({ is_active: z.boolean().optional() });

// ============================================================
// Category Validation
// ============================================================

export const categoryCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1, 'Category name is required').max(100),
  parent_id: z.string().uuid().optional(),
});

// ============================================================
// Unit Validation
// ============================================================

export const unitCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1, 'Unit name is required').max(50),
  symbol: z.string().min(1, 'Symbol is required').max(10),
  decimal_places: z.number().int().min(0).max(3).default(0),
});
