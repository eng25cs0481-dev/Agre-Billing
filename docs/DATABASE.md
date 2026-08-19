# Agre Billing — Database Specification

## 1. Relational Schema Summary

All tables are company-isolated via `company_id` foreign keys and protected by Supabase Row Level Security (RLS).

### Entity-Relationship Architecture

| Table | Primary Purpose | Key Constraints |
|---|---|---|
| `companies` | Multi-tenant organization profile & settings | Primary Key `id` |
| `financial_years` | Fiscal year date bounds (e.g. 2026-04-01 to 2027-03-31) | `UNIQUE(company_id, name)` |
| `profiles` | User accounts linked to Supabase Auth | FK `auth.users(id)` |
| `roles` & `user_roles` | Granular role definitions (Admin, Manager, Accountant, Billing Staff, Viewer) | `UNIQUE(company_id, name)` |
| `ledger_groups` | Hierarchical Chart of Accounts (Assets, Liabilities, Income, Expense, Capital) | `CHECK (nature IN ...)` |
| `ledgers` | Individual ledger accounts (Cash, Bank, Debtors, Creditors, Sales, Purchases, Expenses) | `UNIQUE(company_id, name)` |
| `categories` & `units` | Product categorization and units of measure (Pcs, Kg, Ltr, Box) | `UNIQUE(company_id, name)` |
| `products` | Product catalog with SKU, cost price, selling price, and minimum stock | `UNIQUE(company_id, sku)` |
| `customers` & `suppliers` | Party masters with ledger references and credit terms | `UNIQUE(company_id, code)` |
| `vouchers` | Unified header for Sale, Purchase, Receipt, Payment, Returns, Expense, Journal | `UNIQUE(idempotency_key)` |
| `voucher_items` | Immutable line item snapshots at time of voucher creation | FK `vouchers(id)` |
| `voucher_ledger_entries` | Double-entry journal entries generated per transaction | `CHECK(NOT (debit > 0 AND credit > 0))` |
| `stock_movements` | Inventory balance ledger (sales, purchases, returns, adjustments) | FK `products(id)` |
| `invoice_sequences` | Concurrency-safe atomic sequence counters per FY | `UNIQUE(company_id, fy_id, type)` |
| `audit_logs` | Immutable audit trail for all create/update/cancel operations | JSONB snapshots |

## 2. Server-Side RPC Functions

1. `next_voucher_number(company_id, financial_year_id, voucher_type)`: Atomic increment with row-level locking.
2. `create_sale(...)`: Creates voucher, line items, debit to Debtor/Cash, credit to Sales Account, and negative stock movements.
3. `create_purchase(...)`: Creates voucher, line items, debit to Purchase Account, credit to Creditor/Cash, and positive stock movements.
4. `create_receipt(...)`: Records customer payment, debits Cash/Bank, credits Customer Ledger.
5. `create_payment(...)`: Records vendor payment, debits Supplier Ledger, credits Cash/Bank.
6. `create_expense(...)`: Records expense, debits Expense Ledger, credits Cash/Bank.
7. `cancel_voucher(voucher_id, reason)`: Marks voucher cancelled and atomically writes reversing ledger and stock entries.
8. `setup_company(...)`: Bootstraps new company with default FY, roles, Chart of Accounts, standard ledgers, and units.
