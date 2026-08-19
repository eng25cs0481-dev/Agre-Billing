import type { StockMovementType } from '../types';
import { round2, roundN } from './billing';

// ============================================================
// Stock Calculations
// ============================================================

/**
 * Calculate current stock from movements
 */
export function calculateCurrentStock(
  movements: Array<{ quantity: number }>
): number {
  return roundN(
    movements.reduce((sum, m) => sum + m.quantity, 0),
    3
  );
}

/**
 * Calculate stock value (current stock × cost price)
 */
export function calculateStockValue(
  currentStock: number,
  costPrice: number
): number {
  return round2(currentStock * costPrice);
}

/**
 * Get movement quantity sign based on movement type
 * Positive = stock in, Negative = stock out
 */
export function getMovementQuantity(
  movementType: StockMovementType,
  absoluteQuantity: number
): number {
  switch (movementType) {
    case 'purchase':
    case 'sales_return':
    case 'opening':
      return Math.abs(absoluteQuantity); // stock in
    case 'sale':
    case 'purchase_return':
      return -Math.abs(absoluteQuantity); // stock out
    case 'adjustment':
      return absoluteQuantity; // can be positive or negative
    default:
      return absoluteQuantity;
  }
}

/**
 * Check if stock is below minimum level
 */
export function isBelowMinimumStock(
  currentStock: number,
  minimumStock: number
): boolean {
  return currentStock < minimumStock;
}
