-- ============================================================
-- Agre Billing — Permissive RLS for Local Desktop / POS Counter
-- Allows seamless CRUD operations for desktop client with anon key
-- ============================================================

-- 1. Make company_id optional on tables that contain company_id
ALTER TABLE categories ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE units ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE products ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE suppliers ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE ledgers ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE ledger_groups ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE vouchers ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE stock_movements ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE financial_years ALTER COLUMN company_id DROP NOT NULL;

-- 2. Permissive Policies for Categories
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Users with permission can manage categories" ON categories;
DROP POLICY IF EXISTS "Categories Select Policy" ON categories;
DROP POLICY IF EXISTS "Categories Insert Policy" ON categories;
DROP POLICY IF EXISTS "Categories Update Policy" ON categories;
DROP POLICY IF EXISTS "Categories Delete Policy" ON categories;
CREATE POLICY "Categories Select Policy" ON categories FOR SELECT USING (true);
CREATE POLICY "Categories Insert Policy" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Categories Update Policy" ON categories FOR UPDATE USING (true);
CREATE POLICY "Categories Delete Policy" ON categories FOR DELETE USING (true);

-- 3. Permissive Policies for Units
DROP POLICY IF EXISTS "Users can view units" ON units;
DROP POLICY IF EXISTS "Users with permission can manage units" ON units;
DROP POLICY IF EXISTS "Units Select Policy" ON units;
DROP POLICY IF EXISTS "Units Insert Policy" ON units;
DROP POLICY IF EXISTS "Units Update Policy" ON units;
DROP POLICY IF EXISTS "Units Delete Policy" ON units;
CREATE POLICY "Units Select Policy" ON units FOR SELECT USING (true);
CREATE POLICY "Units Insert Policy" ON units FOR INSERT WITH CHECK (true);
CREATE POLICY "Units Update Policy" ON units FOR UPDATE USING (true);
CREATE POLICY "Units Delete Policy" ON units FOR DELETE USING (true);

-- 4. Permissive Policies for Products
DROP POLICY IF EXISTS "Users can view products" ON products;
DROP POLICY IF EXISTS "Users with permission can manage products" ON products;
DROP POLICY IF EXISTS "Products Select Policy" ON products;
DROP POLICY IF EXISTS "Products Insert Policy" ON products;
DROP POLICY IF EXISTS "Products Update Policy" ON products;
DROP POLICY IF EXISTS "Products Delete Policy" ON products;
CREATE POLICY "Products Select Policy" ON products FOR SELECT USING (true);
CREATE POLICY "Products Insert Policy" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Products Update Policy" ON products FOR UPDATE USING (true);
CREATE POLICY "Products Delete Policy" ON products FOR DELETE USING (true);

-- 5. Permissive Policies for Customers & Suppliers
DROP POLICY IF EXISTS "Users can view customers" ON customers;
DROP POLICY IF EXISTS "Users with permission can manage customers" ON customers;
DROP POLICY IF EXISTS "Customers Select Policy" ON customers;
DROP POLICY IF EXISTS "Customers Insert Policy" ON customers;
DROP POLICY IF EXISTS "Customers Update Policy" ON customers;
DROP POLICY IF EXISTS "Customers Delete Policy" ON customers;
CREATE POLICY "Customers Select Policy" ON customers FOR SELECT USING (true);
CREATE POLICY "Customers Insert Policy" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Customers Update Policy" ON customers FOR UPDATE USING (true);
CREATE POLICY "Customers Delete Policy" ON customers FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users with permission can manage suppliers" ON suppliers;
DROP POLICY IF EXISTS "Suppliers Select Policy" ON suppliers;
DROP POLICY IF EXISTS "Suppliers Insert Policy" ON suppliers;
DROP POLICY IF EXISTS "Suppliers Update Policy" ON suppliers;
DROP POLICY IF EXISTS "Suppliers Delete Policy" ON suppliers;
CREATE POLICY "Suppliers Select Policy" ON suppliers FOR SELECT USING (true);
CREATE POLICY "Suppliers Insert Policy" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Suppliers Update Policy" ON suppliers FOR UPDATE USING (true);
CREATE POLICY "Suppliers Delete Policy" ON suppliers FOR DELETE USING (true);

-- 6. Permissive Policies for Ledgers & Groups
DROP POLICY IF EXISTS "Users can view ledger groups" ON ledger_groups;
DROP POLICY IF EXISTS "Users with permission can manage ledger groups" ON ledger_groups;
DROP POLICY IF EXISTS "Ledger Groups Select Policy" ON ledger_groups;
DROP POLICY IF EXISTS "Ledger Groups Insert Policy" ON ledger_groups;
DROP POLICY IF EXISTS "Ledger Groups Update Policy" ON ledger_groups;
DROP POLICY IF EXISTS "Ledger Groups Delete Policy" ON ledger_groups;
CREATE POLICY "Ledger Groups Select Policy" ON ledger_groups FOR SELECT USING (true);
CREATE POLICY "Ledger Groups Insert Policy" ON ledger_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Ledger Groups Update Policy" ON ledger_groups FOR UPDATE USING (true);
CREATE POLICY "Ledger Groups Delete Policy" ON ledger_groups FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users with permission can view ledgers" ON ledgers;
DROP POLICY IF EXISTS "Users with permission can manage ledgers" ON ledgers;
DROP POLICY IF EXISTS "Ledgers Select Policy" ON ledgers;
DROP POLICY IF EXISTS "Ledgers Insert Policy" ON ledgers;
DROP POLICY IF EXISTS "Ledgers Update Policy" ON ledgers;
DROP POLICY IF EXISTS "Ledgers Delete Policy" ON ledgers;
CREATE POLICY "Ledgers Select Policy" ON ledgers FOR SELECT USING (true);
CREATE POLICY "Ledgers Insert Policy" ON ledgers FOR INSERT WITH CHECK (true);
CREATE POLICY "Ledgers Update Policy" ON ledgers FOR UPDATE USING (true);
CREATE POLICY "Ledgers Delete Policy" ON ledgers FOR DELETE USING (true);

-- 7. Permissive Policies for Vouchers, Items & Stock Movements
DROP POLICY IF EXISTS "Users can view vouchers" ON vouchers;
DROP POLICY IF EXISTS "Users with permission can manage vouchers" ON vouchers;
DROP POLICY IF EXISTS "Vouchers Select Policy" ON vouchers;
DROP POLICY IF EXISTS "Vouchers Insert Policy" ON vouchers;
DROP POLICY IF EXISTS "Vouchers Update Policy" ON vouchers;
DROP POLICY IF EXISTS "Vouchers Delete Policy" ON vouchers;
CREATE POLICY "Vouchers Select Policy" ON vouchers FOR SELECT USING (true);
CREATE POLICY "Vouchers Insert Policy" ON vouchers FOR INSERT WITH CHECK (true);
CREATE POLICY "Vouchers Update Policy" ON vouchers FOR UPDATE USING (true);
CREATE POLICY "Vouchers Delete Policy" ON vouchers FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can view voucher items" ON voucher_items;
DROP POLICY IF EXISTS "Users can manage voucher items" ON voucher_items;
DROP POLICY IF EXISTS "Voucher Items Select Policy" ON voucher_items;
DROP POLICY IF EXISTS "Voucher Items Insert Policy" ON voucher_items;
DROP POLICY IF EXISTS "Voucher Items Update Policy" ON voucher_items;
DROP POLICY IF EXISTS "Voucher Items Delete Policy" ON voucher_items;
CREATE POLICY "Voucher Items Select Policy" ON voucher_items FOR SELECT USING (true);
CREATE POLICY "Voucher Items Insert Policy" ON voucher_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Voucher Items Update Policy" ON voucher_items FOR UPDATE USING (true);
CREATE POLICY "Voucher Items Delete Policy" ON voucher_items FOR DELETE USING (true);

DROP POLICY IF EXISTS "Users can view stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Users can manage stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Stock Movements Select Policy" ON stock_movements;
DROP POLICY IF EXISTS "Stock Movements Insert Policy" ON stock_movements;
CREATE POLICY "Stock Movements Select Policy" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Stock Movements Insert Policy" ON stock_movements FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view voucher ledger entries" ON voucher_ledger_entries;
DROP POLICY IF EXISTS "Users can manage voucher ledger entries" ON voucher_ledger_entries;
DROP POLICY IF EXISTS "Voucher Ledger Entries Select Policy" ON voucher_ledger_entries;
DROP POLICY IF EXISTS "Voucher Ledger Entries Insert Policy" ON voucher_ledger_entries;
CREATE POLICY "Voucher Ledger Entries Select Policy" ON voucher_ledger_entries FOR SELECT USING (true);
CREATE POLICY "Voucher Ledger Entries Insert Policy" ON voucher_ledger_entries FOR INSERT WITH CHECK (true);

-- 8. Permissive Policies for Companies & Financial Years
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Admins can update their company" ON companies;
DROP POLICY IF EXISTS "Companies Select Policy" ON companies;
DROP POLICY IF EXISTS "Companies Insert Policy" ON companies;
DROP POLICY IF EXISTS "Companies Update Policy" ON companies;
CREATE POLICY "Companies Select Policy" ON companies FOR SELECT USING (true);
CREATE POLICY "Companies Insert Policy" ON companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Companies Update Policy" ON companies FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can view their company financial years" ON financial_years;
DROP POLICY IF EXISTS "Admins can manage financial years" ON financial_years;
DROP POLICY IF EXISTS "Financial Years Select Policy" ON financial_years;
DROP POLICY IF EXISTS "Financial Years Insert Policy" ON financial_years;
CREATE POLICY "Financial Years Select Policy" ON financial_years FOR SELECT USING (true);
CREATE POLICY "Financial Years Insert Policy" ON financial_years FOR INSERT WITH CHECK (true);
