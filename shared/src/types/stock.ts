import type { CompanyScoped } from './common';

// ============================================================
// Stock Movement
// ============================================================

export type StockMovementType =
  | 'sale'
  | 'purchase'
  | 'sales_return'
  | 'purchase_return'
  | 'adjustment'
  | 'opening';

export interface StockMovement extends CompanyScoped {
  id: string;
  product_id: string;
  voucher_id?: string;
  movement_type: StockMovementType;
  quantity: number; // positive = in, negative = out
  rate?: number;
  reference?: string;
  created_by?: string;
  created_at: string;
}

export interface StockMovementCreate extends CompanyScoped {
  product_id: string;
  voucher_id?: string;
  movement_type: StockMovementType;
  quantity: number;
  rate?: number;
  reference?: string;
}

// ============================================================
// Stock Summary
// ============================================================

export interface StockSummary {
  product_id: string;
  product_name: string;
  product_sku?: string;
  category_name?: string;
  unit_name?: string;
  current_stock: number;
  minimum_stock: number;
  cost_price: number;
  selling_price: number;
  stock_value: number; // current_stock * cost_price
  is_below_minimum: boolean;
}

// ============================================================
// Stock Movement Report
// ============================================================

export interface StockMovementReport {
  product_id: string;
  product_name: string;
  movements: StockMovementDetail[];
  opening_stock: number;
  total_in: number;
  total_out: number;
  closing_stock: number;
}

export interface StockMovementDetail {
  date: string;
  movement_type: StockMovementType;
  voucher_number?: string;
  voucher_type?: string;
  party_name?: string;
  quantity: number;
  rate?: number;
  running_balance: number;
}

// ============================================================
// Audit Log
// ============================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'cancel';

export interface AuditLog extends CompanyScoped {
  id: string;
  user_id?: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ============================================================
// Sync Metadata
// ============================================================

export interface SyncMetadata {
  id: string;
  device_id: string;
  table_name: string;
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncQueueItem {
  id: string;
  table_name: string;
  operation: 'insert' | 'update' | 'delete';
  record_id: string;
  payload: Record<string, unknown>;
  idempotency_key: string;
  retry_count: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  created_at: string;
}
