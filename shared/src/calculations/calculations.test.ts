import {
  calculateLineAmount,
  calculateBillTotals,
  calculateGrossProfit,
  round2,
  roundN,
} from './billing';
import {
  validateDoubleEntry,
  calculateClosingBalance,
  buildLedgerStatement,
} from './ledger';
import {
  calculateCurrentStock,
  calculateStockValue,
  getMovementQuantity,
} from './stock';

describe('Billing Calculations (No GST, Strict Rate x Qty - Discount)', () => {
  test('calculateLineAmount calculates basic line item without discount', () => {
    const res = calculateLineAmount(5, 120);
    expect(res.amount).toBe(600);
    expect(res.discount).toBe(0);
  });

  test('calculateLineAmount calculates with discount percentage', () => {
    const res = calculateLineAmount(10, 100, 10); // 1000 - 10% = 900
    expect(res.amount).toBe(900);
    expect(res.discount).toBe(100);
  });

  test('calculateLineAmount calculates with fixed discount amount', () => {
    const res = calculateLineAmount(2, 250, 0, 50); // 500 - 50 = 450
    expect(res.amount).toBe(450);
    expect(res.discount).toBe(50);
  });

  test('calculateBillTotals matches project spec example', () => {
    // Example from spec:
    // Product A: 5 x ₹120 = ₹600
    // Product B: 2 x ₹250 = ₹500
    // Subtotal: ₹1,100
    // Bill Discount: ₹100
    // Total: ₹1,000
    const items = [
      { product_name: 'Product A', quantity: 5, rate: 120 },
      { product_name: 'Product B', quantity: 2, rate: 250 },
    ];
    const totals = calculateBillTotals(items, 100);

    expect(totals.subtotal).toBe(1100);
    expect(totals.billDiscount).toBe(100);
    expect(totals.grandTotal).toBe(1000);
  });

  test('calculateGrossProfit calculates correct profit and margin', () => {
    const { profit, margin } = calculateGrossProfit(1000, 700);
    expect(profit).toBe(300);
    expect(margin).toBe(30);
  });
});

describe('Ledger Double-Entry Calculations', () => {
  test('validateDoubleEntry confirms balanced entries', () => {
    const entries = [
      { debit: 1000, credit: 0 },
      { debit: 0, credit: 1000 },
    ];
    const res = validateDoubleEntry(entries);
    expect(res.valid).toBe(true);
    expect(res.difference).toBe(0);
  });

  test('validateDoubleEntry rejects unbalanced entries', () => {
    const entries = [
      { debit: 1000, credit: 0 },
      { debit: 0, credit: 950 },
    ];
    const res = validateDoubleEntry(entries);
    expect(res.valid).toBe(false);
    expect(res.difference).toBe(50);
  });

  test('calculateClosingBalance handles debit and credit balances correctly', () => {
    // Opening Debit 500 + Debit 1000 - Credit 300 = Closing Debit 1200
    const res1 = calculateClosingBalance(500, 'debit', 1000, 300);
    expect(res1.balance).toBe(1200);
    expect(res1.type).toBe('debit');

    // Opening Credit 500 + Debit 200 - Credit 300 = Closing Credit 600
    const res2 = calculateClosingBalance(500, 'credit', 200, 300);
    expect(res2.balance).toBe(600);
    expect(res2.type).toBe('credit');
  });

  test('buildLedgerStatement generates running balances', () => {
    const statement = buildLedgerStatement(
      [
        {
          date: '2026-08-19',
          particular: 'Sales Invoice SAL/000001',
          voucher_type: 'sale',
          voucher_number: 'SAL/000001',
          voucher_id: 'v1',
          debit: 1500,
          credit: 0,
        },
        {
          date: '2026-08-19',
          particular: 'Receipt RCT/000001',
          voucher_type: 'receipt',
          voucher_number: 'RCT/000001',
          voucher_id: 'v2',
          debit: 0,
          credit: 1000,
        },
      ],
      500,
      'debit'
    );

    expect(statement.length).toBe(2);
    expect(statement[0].running_balance).toBe(2000);
    expect(statement[0].balance_type).toBe('debit');
    expect(statement[1].running_balance).toBe(1000);
    expect(statement[1].balance_type).toBe('debit');
  });
});

describe('Stock Calculations', () => {
  test('calculateCurrentStock sums up movements', () => {
    const movements = [
      { quantity: 100 }, // Purchase
      { quantity: -20 }, // Sale
      { quantity: 5 },   // Sales Return
      { quantity: -2 },  // Purchase Return
    ];
    expect(calculateCurrentStock(movements)).toBe(83);
  });

  test('calculateStockValue multiplies stock by cost', () => {
    expect(calculateStockValue(83, 150)).toBe(12450);
  });

  test('getMovementQuantity respects stock flow directions', () => {
    expect(getMovementQuantity('purchase', 10)).toBe(10);
    expect(getMovementQuantity('sale', 10)).toBe(-10);
    expect(getMovementQuantity('sales_return', 5)).toBe(5);
    expect(getMovementQuantity('purchase_return', 3)).toBe(-3);
  });
});
