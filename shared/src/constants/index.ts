export * from './ledger-groups';
export * from './voucher-types';
export * from './roles';

// ============================================================
// Keyboard Shortcuts (Desktop)
// ============================================================

export interface KeyboardShortcut {
  key: string;
  label: string;
  description: string;
  context?: 'global' | 'voucher' | 'list' | 'form';
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Global
  { key: 'F2', label: 'Date', description: 'Change date / Date picker', context: 'global' },
  { key: 'F5', label: 'Payment', description: 'New Payment voucher', context: 'global' },
  { key: 'F6', label: 'Receipt', description: 'New Receipt voucher', context: 'global' },
  { key: 'F8', label: 'Sales', description: 'New Sales voucher', context: 'global' },
  { key: 'F9', label: 'Purchase', description: 'New Purchase voucher', context: 'global' },

  // Form / Voucher
  { key: 'Ctrl+S', label: 'Save', description: 'Save current form', context: 'form' },
  { key: 'Ctrl+P', label: 'Print', description: 'Print current voucher/report', context: 'form' },
  { key: 'Ctrl+N', label: 'New', description: 'Create new record', context: 'form' },
  { key: 'Escape', label: 'Back', description: 'Go back / Cancel', context: 'global' },
  { key: 'Enter', label: 'Select', description: 'Select / Confirm', context: 'global' },

  // List
  { key: 'Ctrl+F', label: 'Search', description: 'Search in list', context: 'list' },
  { key: 'Alt+D', label: 'Delete', description: 'Delete / Deactivate selected', context: 'list' },
  { key: 'Alt+E', label: 'Export', description: 'Export current view', context: 'list' },
];

// ============================================================
// Default Units
// ============================================================

export interface DefaultUnit {
  name: string;
  symbol: string;
  decimal_places: number;
}

export const DEFAULT_UNITS: DefaultUnit[] = [
  { name: 'Pieces', symbol: 'Pcs', decimal_places: 0 },
  { name: 'Kilograms', symbol: 'Kg', decimal_places: 3 },
  { name: 'Grams', symbol: 'g', decimal_places: 0 },
  { name: 'Litres', symbol: 'Ltr', decimal_places: 3 },
  { name: 'Millilitres', symbol: 'ml', decimal_places: 0 },
  { name: 'Metres', symbol: 'm', decimal_places: 2 },
  { name: 'Boxes', symbol: 'Box', decimal_places: 0 },
  { name: 'Dozens', symbol: 'Doz', decimal_places: 0 },
  { name: 'Packets', symbol: 'Pkt', decimal_places: 0 },
  { name: 'Numbers', symbol: 'Nos', decimal_places: 0 },
];

// ============================================================
// Currency
// ============================================================

export const DEFAULT_CURRENCY = {
  code: 'INR',
  symbol: '₹',
  decimal_places: 2,
  name: 'Indian Rupee',
} as const;

// ============================================================
// App Info
// ============================================================

export const APP_NAME = 'Agre Billing';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Shop billing and business management by Agre';
