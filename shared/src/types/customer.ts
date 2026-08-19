import type { Timestamps, CompanyScoped, SoftDeletable } from './common';

// ============================================================
// Customer
// ============================================================

export interface Customer extends Timestamps, CompanyScoped, SoftDeletable {
  id: string;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  ledger_id?: string;
  opening_balance: number;
  credit_limit?: number;
  payment_terms?: number; // days
  notes?: string;
}

export interface CustomerCreate extends CompanyScoped {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  opening_balance?: number;
  credit_limit?: number;
  payment_terms?: number;
  notes?: string;
}

export interface CustomerUpdate extends Partial<Omit<CustomerCreate, 'company_id'>> {
  is_active?: boolean;
}

/** Customer with outstanding balance */
export interface CustomerWithBalance extends Customer {
  total_receivable: number;
  total_received: number;
  outstanding_balance: number;
  ledger_name?: string;
}

// ============================================================
// Supplier
// ============================================================

export interface Supplier extends Timestamps, CompanyScoped, SoftDeletable {
  id: string;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  ledger_id?: string;
  opening_balance: number;
  payment_terms?: number;
  notes?: string;
}

export interface SupplierCreate extends CompanyScoped {
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  opening_balance?: number;
  payment_terms?: number;
  notes?: string;
}

export interface SupplierUpdate extends Partial<Omit<SupplierCreate, 'company_id'>> {
  is_active?: boolean;
}

/** Supplier with outstanding balance */
export interface SupplierWithBalance extends Supplier {
  total_payable: number;
  total_paid: number;
  outstanding_balance: number;
  ledger_name?: string;
}
