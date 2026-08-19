import type { Timestamps, CompanyScoped, SoftDeletable, BalanceType } from './common';

// ============================================================
// Ledger Group
// ============================================================

export type LedgerNature = 'assets' | 'liabilities' | 'income' | 'expense' | 'capital';

export interface LedgerGroup extends Timestamps, CompanyScoped {
  id: string;
  name: string;
  parent_id?: string;
  nature: LedgerNature;
  is_system: boolean;
}

export interface LedgerGroupCreate extends CompanyScoped {
  name: string;
  parent_id?: string;
  nature: LedgerNature;
}

// ============================================================
// Ledger
// ============================================================

export interface Ledger extends Timestamps, CompanyScoped, SoftDeletable {
  id: string;
  group_id: string;
  name: string;
  opening_balance: number;
  opening_balance_type?: BalanceType;
  is_system: boolean;
}

export interface LedgerCreate extends CompanyScoped {
  group_id: string;
  name: string;
  opening_balance?: number;
  opening_balance_type?: BalanceType;
}

export interface LedgerUpdate {
  name?: string;
  group_id?: string;
  opening_balance?: number;
  opening_balance_type?: BalanceType;
  is_active?: boolean;
}

// ============================================================
// Ledger Entry (part of voucher double-entry)
// ============================================================

export interface LedgerEntry {
  id: string;
  voucher_id: string;
  ledger_id: string;
  debit: number;
  credit: number;
  created_at: string;
}

// ============================================================
// Ledger Balance (computed)
// ============================================================

export interface LedgerBalance {
  ledger_id: string;
  ledger_name: string;
  group_name: string;
  nature: LedgerNature;
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  balance_type: BalanceType;
}

// ============================================================
// Ledger Statement Row
// ============================================================

export interface LedgerStatementRow {
  date: string;
  particular: string;
  voucher_type: string;
  voucher_number: string;
  voucher_id: string;
  debit: number;
  credit: number;
  running_balance: number;
  balance_type: BalanceType;
}
