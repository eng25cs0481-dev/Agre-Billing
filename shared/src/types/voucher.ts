import type { Timestamps, CompanyScoped } from './common';

// ============================================================
// Voucher Types
// ============================================================

export type VoucherType =
  | 'sale'
  | 'purchase'
  | 'receipt'
  | 'payment'
  | 'sales_return'
  | 'purchase_return'
  | 'expense'
  | 'journal';

export type VoucherStatus = 'draft' | 'confirmed' | 'cancelled';

export type PaymentMode = 'cash' | 'upi' | 'card' | 'bank' | 'credit';

export type PartyType = 'customer' | 'supplier';

// ============================================================
// Voucher (unified transaction header)
// ============================================================

export interface Voucher extends Timestamps, CompanyScoped {
  id: string;
  financial_year_id: string;
  voucher_type: VoucherType;
  voucher_number: string;
  date: string; // ISO date
  reference_number?: string;
  reference_voucher_id?: string;
  party_id?: string;
  party_type?: PartyType;
  party_name?: string;
  narration?: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_mode?: PaymentMode;
  status: VoucherStatus;
  idempotency_key: string;
  local_voucher_number?: string;
  created_by?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  cancel_reason?: string;
}

// ============================================================
// Voucher Item (line items)
// ============================================================

export interface VoucherItem {
  id: string;
  voucher_id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  unit_name?: string;
  quantity: number;
  rate: number;
  discount_percent: number;
  discount_amount: number;
  amount: number;
  sort_order: number;
  created_at: string;
}

// ============================================================
// Create DTOs
// ============================================================

export interface VoucherItemInput {
  product_id?: string;
  product_name: string;
  product_sku?: string;
  unit_name?: string;
  quantity: number;
  rate: number;
  discount_percent?: number;
  discount_amount?: number;
}

export interface CreateSaleInput {
  company_id: string;
  financial_year_id: string;
  date: string;
  customer_id?: string;
  customer_name?: string; // for walk-in
  narration?: string;
  payment_mode: PaymentMode;
  items: VoucherItemInput[];
  discount_amount?: number; // bill-level discount
  idempotency_key: string;
}

export interface CreatePurchaseInput {
  company_id: string;
  financial_year_id: string;
  date: string;
  supplier_id: string;
  reference_number?: string; // supplier invoice number
  narration?: string;
  payment_mode: PaymentMode;
  items: VoucherItemInput[];
  discount_amount?: number;
  idempotency_key: string;
}

export interface CreateReceiptInput {
  company_id: string;
  financial_year_id: string;
  date: string;
  customer_id: string;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  narration?: string;
  idempotency_key: string;
}

export interface CreatePaymentInput {
  company_id: string;
  financial_year_id: string;
  date: string;
  supplier_id: string;
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  narration?: string;
  idempotency_key: string;
}

export interface CreateSalesReturnInput {
  company_id: string;
  financial_year_id: string;
  date: string;
  reference_voucher_id: string; // original sale voucher
  customer_id: string;
  narration?: string;
  payment_mode: PaymentMode; // refund method
  items: VoucherItemInput[];
  idempotency_key: string;
}

export interface CreatePurchaseReturnInput {
  company_id: string;
  financial_year_id: string;
  date: string;
  reference_voucher_id: string; // original purchase voucher
  supplier_id: string;
  narration?: string;
  payment_mode: PaymentMode;
  items: VoucherItemInput[];
  idempotency_key: string;
}

export interface CreateExpenseInput {
  company_id: string;
  financial_year_id: string;
  date: string;
  ledger_id: string; // expense ledger
  amount: number;
  payment_mode: PaymentMode;
  reference_number?: string;
  narration?: string;
  idempotency_key: string;
}

// ============================================================
// Voucher with items (for display)
// ============================================================

export interface VoucherWithItems extends Voucher {
  items: VoucherItem[];
}

// ============================================================
// Day Book Entry
// ============================================================

export interface DayBookEntry {
  date: string;
  voucher_type: VoucherType;
  voucher_number: string;
  voucher_id: string;
  particular: string;
  debit: number;
  credit: number;
}

// ============================================================
// Invoice Sequence
// ============================================================

export interface InvoiceSequence extends CompanyScoped {
  id: string;
  financial_year_id: string;
  voucher_type: VoucherType;
  prefix: string;
  last_number: number;
  created_at: string;
  updated_at: string;
}
