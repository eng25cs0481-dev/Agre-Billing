import type { Timestamps, CompanyScoped } from './common';

// ============================================================
// Company
// ============================================================

export interface Company extends Timestamps {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  currency_code: string;
  currency_symbol: string;
  decimal_places: number;
  books_beginning_date: string; // ISO date
}

export interface CompanyCreate {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  email?: string;
  currency_code?: string;
  currency_symbol?: string;
  decimal_places?: number;
  books_beginning_date: string;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {}

// ============================================================
// Financial Year
// ============================================================

export interface FinancialYear extends Timestamps, CompanyScoped {
  id: string;
  name: string; // e.g., "2026-27"
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface FinancialYearCreate extends CompanyScoped {
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}
