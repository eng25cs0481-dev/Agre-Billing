-- 1. Add district to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS district TEXT;

-- 2. Monthly Item Sales RPC
CREATE OR REPLACE FUNCTION get_analytics_monthly_items(
  p_company_id UUID,
  p_year INTEGER
) RETURNS TABLE (
  month TEXT,
  product_name TEXT,
  total_quantity NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(v.date, 'YYYY-MM') AS month,
    vi.product_name,
    SUM(vi.quantity) AS total_quantity,
    SUM(vi.amount) AS total_revenue
  FROM vouchers v
  JOIN voucher_items vi ON v.id = vi.voucher_id
  WHERE v.company_id = p_company_id
    AND v.voucher_type = 'sale'
    AND v.status != 'cancelled'
    AND EXTRACT(YEAR FROM v.date) = p_year
  GROUP BY TO_CHAR(v.date, 'YYYY-MM'), vi.product_name
  ORDER BY month ASC, total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Category Sales RPC
CREATE OR REPLACE FUNCTION get_analytics_categories(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  category_name TEXT,
  total_quantity NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.name, 'Uncategorized') AS category_name,
    SUM(vi.quantity) AS total_quantity,
    SUM(vi.amount) AS total_revenue
  FROM vouchers v
  JOIN voucher_items vi ON v.id = vi.voucher_id
  LEFT JOIN products p ON vi.product_id = p.id
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE v.company_id = p_company_id
    AND v.voucher_type = 'sale'
    AND v.status != 'cancelled'
    AND v.date >= p_start_date
    AND v.date <= p_end_date
  GROUP BY c.name
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Geographic Sales RPC
CREATE OR REPLACE FUNCTION get_analytics_geography(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  state TEXT,
  district TEXT,
  city TEXT,
  total_revenue NUMERIC,
  invoice_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.state, 'Unknown State') AS state,
    COALESCE(c.district, 'Unknown District') AS district,
    COALESCE(c.city, 'Unknown City') AS city,
    SUM(v.total_amount) AS total_revenue,
    COUNT(v.id) AS invoice_count
  FROM vouchers v
  JOIN customers c ON v.party_id = c.id
  WHERE v.company_id = p_company_id
    AND v.voucher_type = 'sale'
    AND v.status != 'cancelled'
    AND v.date >= p_start_date
    AND v.date <= p_end_date
  GROUP BY c.state, c.district, c.city
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Customer Analytics RPC
CREATE OR REPLACE FUNCTION get_analytics_customers(
  p_company_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  customer_name TEXT,
  total_revenue NUMERIC,
  invoice_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(c.name, v.party_name, 'Walk-in Customer') AS customer_name,
    SUM(v.total_amount) AS total_revenue,
    COUNT(v.id) AS invoice_count
  FROM vouchers v
  LEFT JOIN customers c ON v.party_id = c.id
  WHERE v.company_id = p_company_id
    AND v.voucher_type = 'sale'
    AND v.status != 'cancelled'
    AND v.date >= p_start_date
    AND v.date <= p_end_date
  GROUP BY COALESCE(c.name, v.party_name, 'Walk-in Customer')
  ORDER BY total_revenue DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
