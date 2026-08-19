import { z } from 'zod';

// ============================================================
// Voucher Item Input Validation
// ============================================================

export const voucherItemInputSchema = z.object({
  product_id: z.string().uuid().optional(),
  product_name: z.string().min(1, 'Product name is required'),
  product_sku: z.string().optional(),
  unit_name: z.string().optional(),
  quantity: z.number().positive('Quantity must be > 0'),
  rate: z.number().min(0, 'Rate must be ≥ 0'),
  discount_percent: z.number().min(0).max(100).default(0),
  discount_amount: z.number().min(0).default(0),
});

// ============================================================
// Payment Mode
// ============================================================

const paymentModeSchema = z.enum(['cash', 'upi', 'card', 'bank', 'credit']);

// ============================================================
// Sale
// ============================================================

export const createSaleSchema = z.object({
  company_id: z.string().uuid(),
  financial_year_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  customer_id: z.string().uuid().optional(),
  customer_name: z.string().max(200).optional(),
  narration: z.string().max(500).optional(),
  payment_mode: paymentModeSchema,
  items: z.array(voucherItemInputSchema).min(1, 'At least one item is required'),
  discount_amount: z.number().min(0).default(0),
  idempotency_key: z.string().uuid(),
});

// ============================================================
// Purchase
// ============================================================

export const createPurchaseSchema = z.object({
  company_id: z.string().uuid(),
  financial_year_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  supplier_id: z.string().uuid(),
  reference_number: z.string().max(100).optional(),
  narration: z.string().max(500).optional(),
  payment_mode: paymentModeSchema,
  items: z.array(voucherItemInputSchema).min(1, 'At least one item is required'),
  discount_amount: z.number().min(0).default(0),
  idempotency_key: z.string().uuid(),
});

// ============================================================
// Receipt (payment from customer)
// ============================================================

export const createReceiptSchema = z.object({
  company_id: z.string().uuid(),
  financial_year_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  customer_id: z.string().uuid(),
  amount: z.number().positive('Amount must be > 0'),
  payment_mode: paymentModeSchema,
  reference_number: z.string().max(100).optional(),
  narration: z.string().max(500).optional(),
  idempotency_key: z.string().uuid(),
});

// ============================================================
// Payment (payment to supplier)
// ============================================================

export const createPaymentSchema = z.object({
  company_id: z.string().uuid(),
  financial_year_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  supplier_id: z.string().uuid(),
  amount: z.number().positive('Amount must be > 0'),
  payment_mode: paymentModeSchema,
  reference_number: z.string().max(100).optional(),
  narration: z.string().max(500).optional(),
  idempotency_key: z.string().uuid(),
});

// ============================================================
// Sales Return
// ============================================================

export const createSalesReturnSchema = z.object({
  company_id: z.string().uuid(),
  financial_year_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reference_voucher_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  narration: z.string().max(500).optional(),
  payment_mode: paymentModeSchema,
  items: z.array(voucherItemInputSchema).min(1),
  idempotency_key: z.string().uuid(),
});

// ============================================================
// Purchase Return
// ============================================================

export const createPurchaseReturnSchema = z.object({
  company_id: z.string().uuid(),
  financial_year_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reference_voucher_id: z.string().uuid(),
  supplier_id: z.string().uuid(),
  narration: z.string().max(500).optional(),
  payment_mode: paymentModeSchema,
  items: z.array(voucherItemInputSchema).min(1),
  idempotency_key: z.string().uuid(),
});

// ============================================================
// Expense
// ============================================================

export const createExpenseSchema = z.object({
  company_id: z.string().uuid(),
  financial_year_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ledger_id: z.string().uuid(),
  amount: z.number().positive('Amount must be > 0'),
  payment_mode: paymentModeSchema,
  reference_number: z.string().max(100).optional(),
  narration: z.string().max(500).optional(),
  idempotency_key: z.string().uuid(),
});

// ============================================================
// Company
// ============================================================

export const companyCreateSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal('')),
  currency_code: z.string().default('INR'),
  currency_symbol: z.string().default('₹'),
  decimal_places: z.number().int().min(0).max(4).default(2),
  books_beginning_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ============================================================
// Ledger
// ============================================================

export const ledgerCreateSchema = z.object({
  company_id: z.string().uuid(),
  group_id: z.string().uuid(),
  name: z.string().min(1, 'Ledger name is required').max(200),
  opening_balance: z.number().default(0),
  opening_balance_type: z.enum(['debit', 'credit']).optional(),
});

export const ledgerGroupCreateSchema = z.object({
  company_id: z.string().uuid(),
  name: z.string().min(1, 'Group name is required').max(200),
  parent_id: z.string().uuid().optional(),
  nature: z.enum(['assets', 'liabilities', 'income', 'expense', 'capital']),
});
