// ============================================================
// Date Utilities
// ============================================================

/**
 * Get today's date as ISO date string (YYYY-MM-DD)
 */
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Format date to DD/MM/YYYY (Indian format)
 */
export function formatDateDMY(dateStr: string): string {
  const date = new Date(dateStr);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Format date to DD-Mon-YYYY (e.g., 19-Aug-2026)
 */
export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(date.getDate()).padStart(2, '0');
  const mon = months[date.getMonth()];
  const yyyy = date.getFullYear();
  return `${dd}-${mon}-${yyyy}`;
}

/**
 * Format ISO timestamp to readable date and time
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return `${formatDateDMY(isoString)} ${date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}`;
}

/**
 * Get financial year string from a date (e.g., "2026-27")
 */
export function getFinancialYearName(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth(); // 0-indexed
  const year = d.getFullYear();

  // Indian FY: April (month 3) to March
  const fyStartYear = month >= 3 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;

  return `${fyStartYear}-${String(fyEndYear).slice(-2)}`;
}

/**
 * Get financial year start and end dates
 */
export function getFinancialYearDates(date: string | Date): {
  start: string;
  end: string;
} {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.getMonth();
  const year = d.getFullYear();

  const fyStartYear = month >= 3 ? year : year - 1;

  return {
    start: `${fyStartYear}-04-01`,
    end: `${fyStartYear + 1}-03-31`,
  };
}

/**
 * Check if a date is within a financial year
 */
export function isDateInFinancialYear(
  date: string,
  fyStart: string,
  fyEnd: string
): boolean {
  return date >= fyStart && date <= fyEnd;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diff = Math.abs(b.getTime() - a.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get aging bracket label
 */
export function getAgingBracket(days: number): string {
  if (days <= 30) return '0-30 days';
  if (days <= 60) return '31-60 days';
  if (days <= 90) return '61-90 days';
  return '90+ days';
}
