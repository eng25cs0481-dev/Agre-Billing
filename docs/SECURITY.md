# Agre Billing — Security & Permissions

## 1. Authentication & Tenant Isolation
- User accounts authenticated via **Supabase Auth** (email/password with secure JWT tokens).
- Multi-tenancy strictly enforced at the PostgreSQL database engine layer via **Row Level Security (RLS)**.
- Client applications use only `VITE_SUPABASE_ANON_KEY`. The **Service Role Key is NEVER embedded or distributed** in client applications.

## 2. Role-Based Access Control (RBAC)

| Role | Sales | Purchases | Receipts/Payments | Ledgers/Reports | Company Settings |
|---|---|---|---|---|---|
| **Admin** | Full | Full | Full | Full | Full |
| **Manager** | Full | Full | Full | Full | Read Only |
| **Accountant** | Read | Read | Full | Full | Read Only |
| **Billing Staff** | Create/Read/Print | None | Create/Read | Read Products/Customers | None |
| **Viewer** | Read Only | Read Only | Read Only | Read Only | None |

## 3. Auditing
- All creation, modification, and cancellation actions are logged into `audit_logs` capturing User ID, Timestamp, Action, and old/new JSON value snapshots.
