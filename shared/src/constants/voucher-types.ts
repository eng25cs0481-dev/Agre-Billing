import type { VoucherType, PaymentMode } from '../types';

// ============================================================
// Voucher Type Labels & Config
// ============================================================

export interface VoucherTypeConfig {
  type: VoucherType;
  label: string;
  shortLabel: string;
  prefix: string;
  hasItems: boolean;
  hasParty: boolean;
  partyType?: 'customer' | 'supplier';
  affectsStock: boolean;
  shortcutKey?: string;
}

export const VOUCHER_TYPE_CONFIG: Record<VoucherType, VoucherTypeConfig> = {
  sale: {
    type: 'sale',
    label: 'Sales',
    shortLabel: 'Sale',
    prefix: 'SAL',
    hasItems: true,
    hasParty: true,
    partyType: 'customer',
    affectsStock: true,
    shortcutKey: 'F8',
  },
  purchase: {
    type: 'purchase',
    label: 'Purchase',
    shortLabel: 'Purch',
    prefix: 'PUR',
    hasItems: true,
    hasParty: true,
    partyType: 'supplier',
    affectsStock: true,
    shortcutKey: 'F9',
  },
  receipt: {
    type: 'receipt',
    label: 'Receipt',
    shortLabel: 'Rcpt',
    prefix: 'RCT',
    hasItems: false,
    hasParty: true,
    partyType: 'customer',
    affectsStock: false,
    shortcutKey: 'F6',
  },
  payment: {
    type: 'payment',
    label: 'Payment',
    shortLabel: 'Pymt',
    prefix: 'PMT',
    hasItems: false,
    hasParty: true,
    partyType: 'supplier',
    affectsStock: false,
    shortcutKey: 'F5',
  },
  sales_return: {
    type: 'sales_return',
    label: 'Sales Return',
    shortLabel: 'SRtn',
    prefix: 'SRT',
    hasItems: true,
    hasParty: true,
    partyType: 'customer',
    affectsStock: true,
  },
  purchase_return: {
    type: 'purchase_return',
    label: 'Purchase Return',
    shortLabel: 'PRtn',
    prefix: 'PRT',
    hasItems: true,
    hasParty: true,
    partyType: 'supplier',
    affectsStock: true,
  },
  expense: {
    type: 'expense',
    label: 'Expense',
    shortLabel: 'Exp',
    prefix: 'EXP',
    hasItems: false,
    hasParty: false,
    affectsStock: false,
  },
  journal: {
    type: 'journal',
    label: 'Journal',
    shortLabel: 'Jrnl',
    prefix: 'JRN',
    hasItems: false,
    hasParty: false,
    affectsStock: false,
  },
};

// ============================================================
// Payment Mode Labels
// ============================================================

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank: 'Bank Transfer',
  credit: 'Credit',
};

// ============================================================
// Voucher Status Labels
// ============================================================

export const VOUCHER_STATUS_LABELS = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
} as const;
