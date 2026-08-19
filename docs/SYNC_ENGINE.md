# Agre Billing — Sync Engine & Offline Architecture

## 1. Synchronization Architecture

Agre Billing implements an **offline-first** design for uninterrupted shop billing during network outages.

```mermaid
sequenceDiagram
    participant User as Cashier / Operator
    participant Client as Agre App (Desktop / Mobile)
    participant LocalDB as Local SQLite
    participant Sync as Sync Engine
    participant Cloud as Supabase Backend

    User->>Client: Create Sale / Invoice
    Client->>LocalDB: Write Voucher, Items, Stock & Ledger entries
    Client->>LocalDB: Enqueue in sync_queue with UUID Idempotency Key
    Client-->>User: Instant Invoice Printed / Saved

    Note over Sync: Connection Restored / Background Worker
    Sync->>LocalDB: Fetch pending queue items
    Sync->>Cloud: Call RPC create_sale(data, idempotency_key)
    Cloud-->>Sync: Returns Canonical Invoice No. (e.g. SAL/000042)
    Sync->>LocalDB: Update local voucher status = 'synced', update canonical number
    Sync->>LocalDB: Remove item from sync_queue
```

## 2. Idempotency & Conflict Resolution

- **Unique Idempotency Key**: Every transaction generated on any device is assigned a UUID v4. The server enforces a `UNIQUE(idempotency_key)` constraint. Retrying network requests will return the existing record without duplicating accounting or stock movements.
- **Delta Sync**: All tables track `updated_at`. When syncing master data (products, prices, customer details), the client queries `updated_at > last_synced_at`.
- **Server Authority**: Server-side timestamp resolution handles concurrent master-data edits.
