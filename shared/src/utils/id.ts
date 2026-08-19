import { v4 as uuidv4 } from 'uuid';

// ============================================================
// ID Generation
// ============================================================

/**
 * Generate a new UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate an idempotency key for offline transactions
 */
export function generateIdempotencyKey(): string {
  return uuidv4();
}

/**
 * Generate a short device ID (8 chars) for offline invoice numbering
 * This should be generated once per device and stored locally
 */
export function generateDeviceId(): string {
  return uuidv4().split('-')[0]; // first 8 hex chars
}

/**
 * Generate a local voucher number for offline use
 * Format: {deviceId}-{localSequence}
 */
export function generateLocalVoucherNumber(
  deviceId: string,
  localSequence: number,
  prefix: string = ''
): string {
  const seq = String(localSequence).padStart(6, '0');
  return prefix ? `${prefix}-${deviceId}-${seq}` : `${deviceId}-${seq}`;
}
