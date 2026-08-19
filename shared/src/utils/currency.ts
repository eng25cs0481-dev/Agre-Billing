import { DEFAULT_CURRENCY } from '../constants';

// ============================================================
// Currency Formatting
// ============================================================

/**
 * Format amount as Indian currency (₹1,23,456.00)
 * Uses Indian number system grouping (last 3, then 2s)
 */
export function formatCurrency(
  amount: number,
  symbol: string = DEFAULT_CURRENCY.symbol,
  decimals: number = DEFAULT_CURRENCY.decimal_places
): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(decimals);

  // Split into integer and decimal parts
  const [intPart, decPart] = fixed.split('.');

  // Apply Indian grouping: last 3 digits, then groups of 2
  let formatted: string;
  if (intPart.length <= 3) {
    formatted = intPart;
  } else {
    const last3 = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const groups: string[] = [];
    let i = remaining.length;
    while (i > 0) {
      const start = Math.max(0, i - 2);
      groups.unshift(remaining.slice(start, i));
      i = start;
    }
    formatted = groups.join(',') + ',' + last3;
  }

  const result = decPart ? `${formatted}.${decPart}` : formatted;
  return `${isNegative ? '-' : ''}${symbol}${result}`;
}

/**
 * Format amount without currency symbol
 */
export function formatAmount(
  amount: number,
  decimals: number = 2
): string {
  return formatCurrency(amount, '', decimals);
}

/**
 * Parse a currency string back to number
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
