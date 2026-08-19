-- ============================================================
-- Agre Billing — Initial Database Schema
-- ============================================================
-- This is the complete schema for the Agre Billing application.
-- It implements a unified voucher model with double-entry accounting.
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  currency_symbol TEXT NOT NULL DEFAULT '₹',
  decimal_places INTEGER NOT NULL DEFAULT 2,
  books_beginning_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FINANCIAL YEARS
-- ============================================================

CREATE TABLE financial_years (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name),
  CHECK(end_date > start_date)
);

CREATE INDEX idx_financial_years_company ON financial_years(company_id);

-- ============================================================
-- PROFILES (extends Supabase Auth)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_company ON profiles(company_id);

-- ============================================================
-- ROLES
-- ============================================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX idx_roles_company ON roles(company_id);

-- ============================================================
-- USER ROLES
-- ============================================================

CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role_id, company_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_company ON user_roles(company_id);

-- ============================================================
-- PERMISSIONS
-- ============================================================

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  module TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROLE PERMISSIONS
-- ============================================================

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role ON role_permissions(role_id);

-- ============================================================
-- LEDGER GROUPS
-- ============================================================

CREATE TABLE ledger_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES ledger_groups(id) ON DELETE SET NULL,
  nature TEXT NOT NULL CHECK (nature IN ('assets', 'liabilities', 'income', 'expense', 'capital')),
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX idx_ledger_groups_company ON ledger_groups(company_id);
CREATE INDEX idx_ledger_groups_parent ON ledger_groups(parent_id);

-- ============================================================
-- LEDGERS
-- ============================================================

CREATE TABLE ledgers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES ledger_groups(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  opening_balance_type TEXT CHECK (opening_balance_type IN ('debit', 'credit')),
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX idx_ledgers_company ON ledgers(company_id);
CREATE INDEX idx_ledgers_group ON ledgers(group_id);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX idx_categories_company ON categories(company_id);

-- ============================================================
-- UNITS
-- ============================================================

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  decimal_places INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, name)
);

CREATE INDEX idx_units_company ON units(company_id);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
  cost_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(15,2) NOT NULL DEFAULT 0,
  wholesale_price NUMERIC(15,2),
  minimum_stock NUMERIC(15,3) NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, sku)
);

CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(company_id, name);
CREATE INDEX idx_products_sku ON products(company_id, sku);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  ledger_id UUID REFERENCES ledgers(id) ON DELETE SET NULL,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit_limit NUMERIC(15,2),
  payment_terms INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE INDEX idx_customers_company ON customers(company_id);
CREATE INDEX idx_customers_name ON customers(company_id, name);
CREATE INDEX idx_customers_phone ON customers(company_id, phone);
CREATE INDEX idx_customers_ledger ON customers(ledger_id);

-- ============================================================
-- SUPPLIERS
-- ============================================================

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  ledger_id UUID REFERENCES ledgers(id) ON DELETE SET NULL,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  payment_terms INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, code)
);

CREATE INDEX idx_suppliers_company ON suppliers(company_id);
CREATE INDEX idx_suppliers_name ON suppliers(company_id, name);
CREATE INDEX idx_suppliers_ledger ON suppliers(ledger_id);

-- ============================================================
-- VOUCHERS (unified transaction header)
-- ============================================================

CREATE TABLE vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  financial_year_id UUID NOT NULL REFERENCES financial_years(id) ON DELETE RESTRICT,
  voucher_type TEXT NOT NULL CHECK (voucher_type IN (
    'sale', 'purchase', 'receipt', 'payment',
    'sales_return', 'purchase_return', 'expense', 'journal'
  )),
  voucher_number TEXT NOT NULL,
  date DATE NOT NULL,
  reference_number TEXT,
  reference_voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  party_id UUID,
  party_type TEXT CHECK (party_type IN ('customer', 'supplier')),
  party_name TEXT,
  narration TEXT,
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  payment_mode TEXT CHECK (payment_mode IN ('cash', 'upi', 'card', 'bank', 'credit')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('draft', 'confirmed', 'cancelled')),
  idempotency_key UUID NOT NULL,
  local_voucher_number TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, financial_year_id, voucher_type, voucher_number),
  UNIQUE(idempotency_key)
);

CREATE INDEX idx_vouchers_company ON vouchers(company_id);
CREATE INDEX idx_vouchers_date ON vouchers(company_id, date);
CREATE INDEX idx_vouchers_type ON vouchers(company_id, voucher_type);
CREATE INDEX idx_vouchers_party ON vouchers(party_id);
CREATE INDEX idx_vouchers_status ON vouchers(company_id, status);
CREATE INDEX idx_vouchers_fy ON vouchers(financial_year_id);
CREATE INDEX idx_vouchers_ref ON vouchers(reference_voucher_id);

-- ============================================================
-- VOUCHER ITEMS (line items for sales/purchases)
-- ============================================================

CREATE TABLE voucher_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  unit_name TEXT,
  quantity NUMERIC(15,3) NOT NULL,
  rate NUMERIC(15,2) NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  amount NUMERIC(15,2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(quantity > 0),
  CHECK(rate >= 0),
  CHECK(discount_percent >= 0 AND discount_percent <= 100),
  CHECK(discount_amount >= 0),
  CHECK(amount >= 0)
);

CREATE INDEX idx_voucher_items_voucher ON voucher_items(voucher_id);
CREATE INDEX idx_voucher_items_product ON voucher_items(product_id);

-- ============================================================
-- VOUCHER LEDGER ENTRIES (double-entry accounting)
-- ============================================================

CREATE TABLE voucher_ledger_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  ledger_id UUID NOT NULL REFERENCES ledgers(id) ON DELETE RESTRICT,
  debit NUMERIC(15,2) NOT NULL DEFAULT 0,
  credit NUMERIC(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(debit >= 0 AND credit >= 0),
  CHECK(NOT (debit > 0 AND credit > 0))
);

CREATE INDEX idx_vle_voucher ON voucher_ledger_entries(voucher_id);
CREATE INDEX idx_vle_ledger ON voucher_ledger_entries(ledger_id);

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN (
    'sale', 'purchase', 'sales_return', 'purchase_return',
    'adjustment', 'opening'
  )),
  quantity NUMERIC(15,3) NOT NULL,
  rate NUMERIC(15,2),
  reference TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_company ON stock_movements(company_id);
CREATE INDEX idx_stock_movements_voucher ON stock_movements(voucher_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);

-- ============================================================
-- INVOICE SEQUENCES
-- ============================================================

CREATE TABLE invoice_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  financial_year_id UUID NOT NULL REFERENCES financial_years(id) ON DELETE CASCADE,
  voucher_type TEXT NOT NULL,
  prefix TEXT NOT NULL DEFAULT '',
  last_number INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, financial_year_id, voucher_type)
);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- SYNC METADATA
-- ============================================================

CREATE TABLE sync_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(device_id, table_name)
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON financial_years
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON ledger_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON ledgers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON vouchers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON invoice_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON sync_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
