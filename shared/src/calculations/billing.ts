import type { VoucherItemInput } from '../types';

// ============================================================
// Billing Calculations
// ============================================================

/**
 * Calculate line item amount: (quantity × rate) - discount
 */
export function calculateLineAmount(
  quantity: number,
  rate: number,
  discountPercent: number = 0,
  discountAmount: number = 0
): { amount: number; discount: number } {
  const gross = round2(quantity * rate);

  let discount = discountAmount;
  if (discountPercent > 0 && discountAmount === 0) {
    discount = round2(gross * discountPercent / 100);
  }

  const amount = round2(gross - discount);

  return { amount: Math.max(0, amount), discount };
}

/**
 * Calculate bill totals from line items
 */
export function calculateBillTotals(
  items: VoucherItemInput[],
  billDiscountAmount: number = 0
): {
  subtotal: number;
  itemDiscountTotal: number;
  billDiscount: number;
  grandTotal: number;
  itemResults: Array<{
    quantity: number;
    rate: number;
    discount_percent: number;
    discount_amount: number;
    amount: number;
  }>;
} {
  let subtotal = 0;
  let itemDiscountTotal = 0;

  const itemResults = items.map(item => {
    const { amount, discount } = calculateLineAmount(
      item.quantity,
      item.rate,
      item.discount_percent ?? 0,
      item.discount_amount ?? 0
    );

    subtotal += amount;
    itemDiscountTotal += discount;

    return {
      quantity: item.quantity,
      rate: item.rate,
      discount_percent: item.discount_percent ?? 0,
      discount_amount: discount,
      amount,
    };
  });

  const billDiscount = round2(billDiscountAmount);
  const grandTotal = round2(Math.max(0, subtotal - billDiscount));

  return {
    subtotal: round2(subtotal),
    itemDiscountTotal: round2(itemDiscountTotal),
    billDiscount,
    grandTotal,
    itemResults,
  };
}

/**
 * Calculate gross profit from a sale
 */
export function calculateGrossProfit(
  sellingAmount: number,
  costAmount: number
): { profit: number; margin: number } {
  const profit = round2(sellingAmount - costAmount);
  const margin = sellingAmount > 0 ? round2((profit / sellingAmount) * 100) : 0;
  return { profit, margin };
}

// ============================================================
// Rounding Utilities
// ============================================================

/**
 * Round to 2 decimal places (currency)
 */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Round to N decimal places
 */
export function roundN(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
