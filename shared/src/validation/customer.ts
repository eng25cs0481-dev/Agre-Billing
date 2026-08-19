import { z } from 'zod';

// ============================================================
// Customer Validation
// ============================================================

export const customerCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1, 'Customer name is required').max(200),
  code: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  opening_balance: z.number().min(0).default(0),
  credit_limit: z.number().min(0).optional(),
  payment_terms: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export const customerUpdateSchema = customerCreateSchema
  .omit({ company_id: true })
  .partial()
  .extend({ is_active: z.boolean().optional() });

// ============================================================
// Supplier Validation
// ============================================================

export const supplierCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1, 'Supplier name is required').max(200),
  code: z.string().max(20).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  opening_balance: z.number().min(0).default(0),
  payment_terms: z.number().int().min(0).optional(),
  notes: z.string().max(1000).optional(),
});

export const supplierUpdateSchema = supplierCreateSchema
  .omit({ company_id: true })
  .partial()
  .extend({ is_active: z.boolean().optional() });
