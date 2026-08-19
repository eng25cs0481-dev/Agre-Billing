-- ============================================================
-- Agre Billing — Seed Data
-- ============================================================
-- Seeds the permissions table. Company-specific data (roles,
-- ledger groups, ledgers, units) are created by the setup_company() RPC.
-- ============================================================

-- Permissions
INSERT INTO permissions (name, display_name, module) VALUES
  -- Company
  ('company.read', 'View company settings', 'company'),
  ('company.update', 'Edit company settings', 'company'),
  -- Users
  ('users.create', 'Create users', 'users'),
  ('users.read', 'View users', 'users'),
  ('users.update', 'Edit users', 'users'),
  ('users.delete', 'Deactivate users', 'users'),
  -- Products
  ('products.create', 'Create products', 'products'),
  ('products.read', 'View products', 'products'),
  ('products.update', 'Edit products', 'products'),
  ('products.delete', 'Deactivate products', 'products'),
  -- Categories
  ('categories.create', 'Create categories', 'categories'),
  ('categories.read', 'View categories', 'categories'),
  ('categories.update', 'Edit categories', 'categories'),
  ('categories.delete', 'Delete categories', 'categories'),
  -- Units
  ('units.create', 'Create units', 'units'),
  ('units.read', 'View units', 'units'),
  ('units.update', 'Edit units', 'units'),
  ('units.delete', 'Delete units', 'units'),
  -- Customers
  ('customers.create', 'Create customers', 'customers'),
  ('customers.read', 'View customers', 'customers'),
  ('customers.update', 'Edit customers', 'customers'),
  ('customers.delete', 'Deactivate customers', 'customers'),
  -- Suppliers
  ('suppliers.create', 'Create suppliers', 'suppliers'),
  ('suppliers.read', 'View suppliers', 'suppliers'),
  ('suppliers.update', 'Edit suppliers', 'suppliers'),
  ('suppliers.delete', 'Deactivate suppliers', 'suppliers'),
  -- Sales
  ('sales.create', 'Create sales', 'sales'),
  ('sales.read', 'View sales', 'sales'),
  ('sales.update', 'Edit sales', 'sales'),
  ('sales.cancel', 'Cancel sales', 'sales'),
  ('sales.print', 'Print invoices', 'sales'),
  -- Purchases
  ('purchases.create', 'Create purchases', 'purchases'),
  ('purchases.read', 'View purchases', 'purchases'),
  ('purchases.update', 'Edit purchases', 'purchases'),
  ('purchases.cancel', 'Cancel purchases', 'purchases'),
  -- Receipts
  ('receipts.create', 'Create receipts', 'receipts'),
  ('receipts.read', 'View receipts', 'receipts'),
  ('receipts.cancel', 'Cancel receipts', 'receipts'),
  -- Payments
  ('payments.create', 'Create payments', 'payments'),
  ('payments.read', 'View payments', 'payments'),
  ('payments.cancel', 'Cancel payments', 'payments'),
  -- Sales Returns
  ('sales_returns.create', 'Create sales returns', 'sales_returns'),
  ('sales_returns.read', 'View sales returns', 'sales_returns'),
  -- Purchase Returns
  ('purchase_returns.create', 'Create purchase returns', 'purchase_returns'),
  ('purchase_returns.read', 'View purchase returns', 'purchase_returns'),
  -- Expenses
  ('expenses.create', 'Create expenses', 'expenses'),
  ('expenses.read', 'View expenses', 'expenses'),
  ('expenses.update', 'Edit expenses', 'expenses'),
  ('expenses.cancel', 'Cancel expenses', 'expenses'),
  -- Ledgers
  ('ledgers.create', 'Create ledgers', 'ledgers'),
  ('ledgers.read', 'View ledgers', 'ledgers'),
  ('ledgers.update', 'Edit ledgers', 'ledgers'),
  -- Reports
  ('reports.read', 'View reports', 'reports'),
  -- Settings
  ('settings.read', 'View settings', 'settings'),
  ('settings.update', 'Edit settings', 'settings'),
  -- Audit
  ('audit.read', 'View audit logs', 'audit')
ON CONFLICT (name) DO NOTHING;
