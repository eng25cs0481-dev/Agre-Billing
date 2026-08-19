-- ============================================================
-- Agre Billing — Row Level Security Policies
-- ============================================================

-- Helper function: Get current user's company_id
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: Check if current user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(required_permission TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = get_user_company_id()
      AND p.name = required_permission
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: Check if user has any of the given roles
CREATE OR REPLACE FUNCTION has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.company_id = get_user_company_id()
      AND r.name = required_role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- COMPANIES
-- ============================================================

CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id = get_user_company_id());

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id = get_user_company_id() AND has_role('admin'));

-- ============================================================
-- FINANCIAL YEARS
-- ============================================================

CREATE POLICY "Users can view their company financial years"
  ON financial_years FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage financial years"
  ON financial_years FOR ALL
  USING (company_id = get_user_company_id() AND has_role('admin'));

-- ============================================================
-- PROFILES
-- ============================================================

CREATE POLICY "Users can view profiles in their company"
  ON profiles FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- ============================================================
-- ROLES & PERMISSIONS (read-only for non-admins)
-- ============================================================

CREATE POLICY "Users can view roles in their company"
  ON roles FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Anyone can view permissions"
  ON permissions FOR SELECT
  USING (true);

CREATE POLICY "Users can view role permissions"
  ON role_permissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM roles r WHERE r.id = role_id AND r.company_id = get_user_company_id()
  ));

CREATE POLICY "Users can view user roles in their company"
  ON user_roles FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (company_id = get_user_company_id() AND has_role('admin'));

-- ============================================================
-- LEDGER GROUPS
-- ============================================================

CREATE POLICY "Users can view ledger groups"
  ON ledger_groups FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users with permission can manage ledger groups"
  ON ledger_groups FOR ALL
  USING (company_id = get_user_company_id() AND has_permission('ledgers.create'));

-- ============================================================
-- LEDGERS
-- ============================================================

CREATE POLICY "Users with permission can view ledgers"
  ON ledgers FOR SELECT
  USING (company_id = get_user_company_id() AND has_permission('ledgers.read'));

CREATE POLICY "Users with permission can manage ledgers"
  ON ledgers FOR ALL
  USING (company_id = get_user_company_id() AND has_permission('ledgers.create'));

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE POLICY "Users can view categories"
  ON categories FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users with permission can manage categories"
  ON categories FOR ALL
  USING (company_id = get_user_company_id() AND has_permission('categories.create'));

-- ============================================================
-- UNITS
-- ============================================================

CREATE POLICY "Users can view units"
  ON units FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Users with permission can manage units"
  ON units FOR ALL
  USING (company_id = get_user_company_id() AND has_permission('units.create'));

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE POLICY "Users with permission can view products"
  ON products FOR SELECT
  USING (company_id = get_user_company_id() AND has_permission('products.read'));

CREATE POLICY "Users with permission can create products"
  ON products FOR INSERT
  WITH CHECK (company_id = get_user_company_id() AND has_permission('products.create'));

CREATE POLICY "Users with permission can update products"
  ON products FOR UPDATE
  USING (company_id = get_user_company_id() AND has_permission('products.update'));

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE POLICY "Users with permission can view customers"
  ON customers FOR SELECT
  USING (company_id = get_user_company_id() AND has_permission('customers.read'));

CREATE POLICY "Users with permission can create customers"
  ON customers FOR INSERT
  WITH CHECK (company_id = get_user_company_id() AND has_permission('customers.create'));

CREATE POLICY "Users with permission can update customers"
  ON customers FOR UPDATE
  USING (company_id = get_user_company_id() AND has_permission('customers.update'));

-- ============================================================
-- SUPPLIERS
-- ============================================================

CREATE POLICY "Users with permission can view suppliers"
  ON suppliers FOR SELECT
  USING (company_id = get_user_company_id() AND has_permission('suppliers.read'));

CREATE POLICY "Users with permission can create suppliers"
  ON suppliers FOR INSERT
  WITH CHECK (company_id = get_user_company_id() AND has_permission('suppliers.create'));

CREATE POLICY "Users with permission can update suppliers"
  ON suppliers FOR UPDATE
  USING (company_id = get_user_company_id() AND has_permission('suppliers.update'));

-- ============================================================
-- VOUCHERS
-- ============================================================

CREATE POLICY "Users can view vouchers in their company"
  ON vouchers FOR SELECT
  USING (company_id = get_user_company_id());

-- Insert/update handled by RPC functions (SECURITY DEFINER)

-- ============================================================
-- VOUCHER ITEMS
-- ============================================================

CREATE POLICY "Users can view voucher items"
  ON voucher_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM vouchers v WHERE v.id = voucher_id AND v.company_id = get_user_company_id()
  ));

-- ============================================================
-- VOUCHER LEDGER ENTRIES
-- ============================================================

CREATE POLICY "Users can view ledger entries"
  ON voucher_ledger_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM vouchers v WHERE v.id = voucher_id AND v.company_id = get_user_company_id()
  ));

-- ============================================================
-- STOCK MOVEMENTS
-- ============================================================

CREATE POLICY "Users can view stock movements"
  ON stock_movements FOR SELECT
  USING (company_id = get_user_company_id());

-- ============================================================
-- INVOICE SEQUENCES
-- ============================================================

CREATE POLICY "Users can view invoice sequences"
  ON invoice_sequences FOR SELECT
  USING (company_id = get_user_company_id());

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE POLICY "Users with audit permission can view logs"
  ON audit_logs FOR SELECT
  USING (company_id = get_user_company_id() AND has_permission('audit.read'));

-- ============================================================
-- SYNC METADATA
-- ============================================================

CREATE POLICY "Users can manage their sync metadata"
  ON sync_metadata FOR ALL
  USING (true);
