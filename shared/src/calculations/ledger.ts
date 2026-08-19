import type { LedgerEntry, BalanceType, LedgerStatementRow, LedgerBalance } from '../types';
import { round2 } from './billing';

// ============================================================
// Ledger Calculations
// ============================================================

/**
 * Validate that a set of ledger entries balances (total debit = total credit)
 */
export function validateDoubleEntry(entries: Array<{ debit: number; credit: number }>): {
  valid: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  const totalDebit = round2(entries.reduce((sum, e) => sum + (e.debit || 0), 0));
  const totalCredit = round2(entries.reduce((sum, e) => sum + (e.credit || 0), 0));
  const difference = round2(Math.abs(totalDebit - totalCredit));

  return {
    valid: difference < 0.01, // tolerance for floating point
    totalDebit,
    totalCredit,
    difference,
  };
}

/**
 * Calculate closing balance from opening + transactions
 */
export function calculateClosingBalance(
  openingBalance: number,
  openingType: BalanceType | undefined,
  totalDebit: number,
  totalCredit: number
): { balance: number; type: BalanceType } {
  // Convert opening to a signed number (debit = positive, credit = negative)
  let runningBalance = openingType === 'credit' ? -openingBalance : openingBalance;

  // Debit increases, credit decreases the signed balance
  runningBalance += totalDebit - totalCredit;

  const absBalance = round2(Math.abs(runningBalance));
  const type: BalanceType = runningBalance >= 0 ? 'debit' : 'credit';

  return { balance: absBalance, type };
}

/**
 * Build a running-balance ledger statement from entries
 */
export function buildLedgerStatement(
  entries: Array<{
    date: string;
    particular: string;
    voucher_type: string;
    voucher_number: string;
    voucher_id: string;
    debit: number;
    credit: number;
  }>,
  openingBalance: number = 0,
  openingType: BalanceType = 'debit'
): LedgerStatementRow[] {
  let runningBalance = openingType === 'credit' ? -openingBalance : openingBalance;

  return entries.map(entry => {
    runningBalance += entry.debit - entry.credit;

    return {
      date: entry.date,
      particular: entry.particular,
      voucher_type: entry.voucher_type,
      voucher_number: entry.voucher_number,
      voucher_id: entry.voucher_id,
      debit: entry.debit,
      credit: entry.credit,
      running_balance: round2(Math.abs(runningBalance)),
      balance_type: runningBalance >= 0 ? 'debit' as BalanceType : 'credit' as BalanceType,
    };
  });
}
