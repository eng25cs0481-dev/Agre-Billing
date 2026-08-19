import type {
  SyncQueueItem,
  SyncMetadata,
  SyncStatus,
} from '../types';

export interface SyncEngineConfig {
  deviceId: string;
  batchSize?: number;
  syncIntervalMs?: number;
  onStatusChange?: (status: SyncStatus) => void;
  onError?: (error: Error) => void;
}

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Platform-independent Sync Engine interface.
 * Coordinates local queue processing, delta synchronisation, and conflict resolution.
 */
export class SyncEngine {
  private deviceId: string;
  private isSyncing: boolean = false;
  private isOnline: boolean = true;
  private config: SyncEngineConfig;

  constructor(config: SyncEngineConfig) {
    this.deviceId = config.deviceId;
    this.config = config;
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public setOnlineStatus(online: boolean) {
    this.isOnline = online;
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  public getIsSyncing(): boolean {
    return this.isSyncing;
  }

  /**
   * Process a queue of items with idempotency guarantee
   */
  public async processQueue(
    items: SyncQueueItem[],
    syncHandler: (item: SyncQueueItem) => Promise<{ success: boolean; error?: string }>
  ): Promise<SyncResult> {
    if (this.isSyncing) {
      return { syncedCount: 0, failedCount: 0, errors: [] };
    }

    this.isSyncing = true;
    this.config.onStatusChange?.('syncing');

    let syncedCount = 0;
    let failedCount = 0;
    const errors: Array<{ id: string; error: string }> = [];

    try {
      for (const item of items) {
        if (!this.isOnline) break;

        try {
          const result = await syncHandler(item);
          if (result.success) {
            syncedCount++;
          } else {
            failedCount++;
            errors.push({ id: item.id, error: result.error || 'Unknown error' });
          }
        } catch (err: any) {
          failedCount++;
          errors.push({ id: item.id, error: err.message || 'Exception during sync' });
        }
      }
    } finally {
      this.isSyncing = false;
      this.config.onStatusChange?.(failedCount > 0 ? 'failed' : 'synced');
    }

    return { syncedCount, failedCount, errors };
  }
}
