import type { LedgerNature } from '../types';

// ============================================================
// Default Ledger Groups (Chart of Accounts)
// ============================================================

export interface DefaultLedgerGroup {
  name: string;
  nature: LedgerNature;
  parent?: string;
  is_system: boolean;
}

export const DEFAULT_LEDGER_GROUPS: DefaultLedgerGroup[] = [
  // Primary Groups
  { name: 'Capital Account', nature: 'capital', is_system: true },
  { name: 'Current Assets', nature: 'assets', is_system: true },
  { name: 'Fixed Assets', nature: 'assets', is_system: true },
  { name: 'Current Liabilities', nature: 'liabilities', is_system: true },
  { name: 'Direct Income', nature: 'income', is_system: true },
  { name: 'Indirect Income', nature: 'income', is_system: true },
  { name: 'Direct Expenses', nature: 'expense', is_system: true },
  { name: 'Indirect Expenses', nature: 'expense', is_system: true },

  // Sub-groups under Current Assets
  { name: 'Cash-in-Hand', nature: 'assets', parent: 'Current Assets', is_system: true },
  { name: 'Bank Accounts', nature: 'assets', parent: 'Current Assets', is_system: true },
  { name: 'Sundry Debtors', nature: 'assets', parent: 'Current Assets', is_system: true },

  // Sub-groups under Current Liabilities
  { name: 'Sundry Creditors', nature: 'liabilities', parent: 'Current Liabilities', is_system: true },
];

// ============================================================
// Default Ledgers (auto-created for every company)
// ============================================================

export interface DefaultLedger {
  name: string;
  group: string;
  is_system: boolean;
}

export const DEFAULT_LEDGERS: DefaultLedger[] = [
  { name: 'Cash', group: 'Cash-in-Hand', is_system: true },
  { name: 'Sales Account', group: 'Direct Income', is_system: true },
  { name: 'Purchase Account', group: 'Direct Expenses', is_system: true },
];

// ============================================================
// Ledger Group Nature Labels
// ============================================================

export const LEDGER_NATURE_LABELS: Record<LedgerNature, string> = {
  assets: 'Assets',
  liabilities: 'Liabilities',
  income: 'Income',
  expense: 'Expenses',
  capital: 'Capital',
};
