// ============================================================
// Common types used across all entities
// ============================================================

/** Standard timestamp fields for all database entities */
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

/** Soft-deletable entities use is_active instead of deletion */
export interface SoftDeletable {
  is_active: boolean;
}

/** Entities that belong to a company */
export interface CompanyScoped {
  company_id: string;
}

/** Pagination parameters */
export interface PaginationParams {
  page: number;
  limit: number;
}

/** Paginated response wrapper */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Sort parameters */
export interface SortParams {
  field: string;
  direction: SortDirection;
}

/** Date range filter */
export interface DateRange {
  from: string; // ISO date string
  to: string;   // ISO date string
}

/** Sync status for offline records */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

/** Base interface for all local (SQLite) entities with sync tracking */
export interface LocalEntity {
  _sync_status: SyncStatus;
  _sync_error?: string;
  _local_id: string;
  _idempotency_key: string;
}

/** API error response */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Operation result */
export type Result<T, E = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

/** Currency amount — always in smallest unit (paise) for calculations, display in rupees */
export type Amount = number;

/** Balance type for opening balances */
export type BalanceType = 'debit' | 'credit';
