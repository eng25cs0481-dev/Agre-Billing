-- ============================================================
-- Agre Billing — RPC Functions for Atomic Transactions
-- ============================================================

-- ============================================================
-- NEXT VOUCHER NUMBER
-- Safely allocates the next number using FOR UPDATE lock
-- ============================================================

CREATE OR REPLACE FUNCTION next_voucher_number(
  p_company_id UUID,
  p_financial_year_id UUID,
  p_voucher_type TEXT
)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_next_number INTEGER;
  v_result TEXT;
BEGIN
  -- Insert sequence row if it doesn't exist
  INSERT INTO invoice_sequences (company_id, financial_year_id, voucher_type, prefix, last_number)
  VALUES (p_company_id, p_financial_year_id, p_voucher_type,
    CASE p_voucher_type
      WHEN 'sale' THEN 'SAL'
      WHEN 'purchase' THEN 'PUR'
      WHEN 'receipt' THEN 'RCT'
      WHEN 'payment' THEN 'PMT'
      WHEN 'sales_return' THEN 'SRT'
      WHEN 'purchase_return' THEN 'PRT'
      WHEN 'expense' THEN 'EXP'
      WHEN 'journal' THEN 'JRN'
      ELSE 'VCH'
    END,
    0
  )
  ON CONFLICT (company_id, financial_year_id, voucher_type) DO NOTHING;

  -- Lock the row and get next number
  UPDATE invoice_sequences
  SET last_number = last_number + 1,
      updated_at = NOW()
  WHERE company_id = p_company_id
    AND financial_year_id = p_financial_year_id
    AND voucher_type = p_voucher_type
  RETURNING prefix, last_number INTO v_prefix, v_next_number;

  -- Format: PREFIX/NNNNNN (e.g., SAL/000001)
  v_result := v_prefix || '/' || LPAD(v_next_number::TEXT, 6, '0');

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CREATE SALE (atomic)
-- ============================================================

CREATE OR REPLACE FUNCTION create_sale(
  p_company_id UUID,
  p_financial_year_id UUID,
  p_date DATE,
  p_customer_id UUID DEFAULT NULL,
  p_customer_name TEXT DEFAULT 'Walk-in Customer',
  p_narration TEXT DEFAULT NULL,
  p_payment_mode TEXT DEFAULT 'cash',
  p_items JSONB DEFAULT '[]'::JSONB,
  p_discount_amount NUMERIC DEFAULT 0,
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher_id UUID;
  v_voucher_number TEXT;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_item_amount NUMERIC;
  v_item_discount NUMERIC;
  v_party_name TEXT;
  v_customer_ledger_id UUID;
  v_cash_ledger_id UUID;
  v_sales_ledger_id UUID;
  v_sort_order INTEGER := 0;
  v_existing_voucher_id UUID;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_voucher_id
    FROM vouchers WHERE idempotency_key = p_idempotency_key;
    IF v_existing_voucher_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'voucher_id', v_existing_voucher_id,
        'duplicate', true
      );
    END IF;
  END IF;

  -- Get next voucher number
  v_voucher_number := next_voucher_number(p_company_id, p_financial_year_id, 'sale');

  -- Resolve party name
  IF p_customer_id IS NOT NULL THEN
    SELECT name, ledger_id INTO v_party_name, v_customer_ledger_id
    FROM customers WHERE id = p_customer_id AND company_id = p_company_id;
  ELSE
    v_party_name := COALESCE(p_customer_name, 'Walk-in Customer');
  END IF;

  -- Get system ledger IDs
  SELECT id INTO v_cash_ledger_id
  FROM ledgers WHERE company_id = p_company_id AND name = 'Cash' AND is_system = true;

  SELECT id INTO v_sales_ledger_id
  FROM ledgers WHERE company_id = p_company_id AND name = 'Sales Account' AND is_system = true;

  -- Calculate totals from items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_discount := COALESCE((v_item->>'discount_amount')::NUMERIC, 0);
    IF v_item_discount = 0 AND COALESCE((v_item->>'discount_percent')::NUMERIC, 0) > 0 THEN
      v_item_discount := ROUND(
        (v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC *
        (v_item->>'discount_percent')::NUMERIC / 100, 2
      );
    END IF;
    v_item_amount := ROUND(
      (v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC - v_item_discount, 2
    );
    v_subtotal := v_subtotal + v_item_amount;
  END LOOP;

  v_total := GREATEST(0, v_subtotal - p_discount_amount);

  -- Create voucher
  INSERT INTO vouchers (
    company_id, financial_year_id, voucher_type, voucher_number,
    date, party_id, party_type, party_name, narration,
    subtotal, discount_amount, total_amount, payment_mode,
    status, idempotency_key, created_by
  ) VALUES (
    p_company_id, p_financial_year_id, 'sale', v_voucher_number,
    p_date, p_customer_id, 'customer', v_party_name, p_narration,
    v_subtotal, p_discount_amount, v_total, p_payment_mode,
    'confirmed', COALESCE(p_idempotency_key, uuid_generate_v4()), auth.uid()
  )
  RETURNING id INTO v_voucher_id;

  -- Create voucher items + stock movements
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_sort_order := v_sort_order + 1;
    v_item_discount := COALESCE((v_item->>'discount_amount')::NUMERIC, 0);
    IF v_item_discount = 0 AND COALESCE((v_item->>'discount_percent')::NUMERIC, 0) > 0 THEN
      v_item_discount := ROUND(
        (v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC *
        (v_item->>'discount_percent')::NUMERIC / 100, 2
      );
    END IF;
    v_item_amount := ROUND(
      (v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC - v_item_discount, 2
    );

    INSERT INTO voucher_items (
      voucher_id, product_id, product_name, product_sku, unit_name,
      quantity, rate, discount_percent, discount_amount, amount, sort_order
    ) VALUES (
      v_voucher_id,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      v_item->>'product_sku',
      v_item->>'unit_name',
      (v_item->>'quantity')::NUMERIC,
      (v_item->>'rate')::NUMERIC,
      COALESCE((v_item->>'discount_percent')::NUMERIC, 0),
      v_item_discount,
      v_item_amount,
      v_sort_order
    );

    -- Stock movement (negative = stock out)
    IF (v_item->>'product_id') IS NOT NULL THEN
      INSERT INTO stock_movements (
        company_id, product_id, voucher_id, movement_type,
        quantity, rate, created_by
      ) VALUES (
        p_company_id,
        (v_item->>'product_id')::UUID,
        v_voucher_id,
        'sale',
        -ABS((v_item->>'quantity')::NUMERIC),
        (v_item->>'rate')::NUMERIC,
        auth.uid()
      );
    END IF;
  END LOOP;

  -- Double-entry ledger entries
  IF p_payment_mode = 'credit' AND v_customer_ledger_id IS NOT NULL THEN
    -- Debit: Customer ledger (receivable)
    INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
    VALUES (v_voucher_id, v_customer_ledger_id, v_total, 0);
  ELSE
    -- Debit: Cash/Bank
    INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
    VALUES (v_voucher_id, v_cash_ledger_id, v_total, 0);
  END IF;

  -- Credit: Sales Account
  INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
  VALUES (v_voucher_id, v_sales_ledger_id, 0, v_total);

  -- Audit log
  INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, new_values)
  VALUES (p_company_id, auth.uid(), 'create', 'voucher', v_voucher_id,
    jsonb_build_object('voucher_type', 'sale', 'voucher_number', v_voucher_number, 'total', v_total)
  );

  RETURN jsonb_build_object(
    'voucher_id', v_voucher_id,
    'voucher_number', v_voucher_number,
    'total_amount', v_total,
    'duplicate', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CREATE PURCHASE (atomic)
-- ============================================================

CREATE OR REPLACE FUNCTION create_purchase(
  p_company_id UUID,
  p_financial_year_id UUID,
  p_date DATE,
  p_supplier_id UUID,
  p_reference_number TEXT DEFAULT NULL,
  p_narration TEXT DEFAULT NULL,
  p_payment_mode TEXT DEFAULT 'credit',
  p_items JSONB DEFAULT '[]'::JSONB,
  p_discount_amount NUMERIC DEFAULT 0,
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher_id UUID;
  v_voucher_number TEXT;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_item_amount NUMERIC;
  v_item_discount NUMERIC;
  v_supplier_name TEXT;
  v_supplier_ledger_id UUID;
  v_cash_ledger_id UUID;
  v_purchase_ledger_id UUID;
  v_sort_order INTEGER := 0;
  v_existing_voucher_id UUID;
BEGIN
  -- Idempotency check
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_voucher_id FROM vouchers WHERE idempotency_key = p_idempotency_key;
    IF v_existing_voucher_id IS NOT NULL THEN
      RETURN jsonb_build_object('voucher_id', v_existing_voucher_id, 'duplicate', true);
    END IF;
  END IF;

  v_voucher_number := next_voucher_number(p_company_id, p_financial_year_id, 'purchase');

  SELECT name, ledger_id INTO v_supplier_name, v_supplier_ledger_id
  FROM suppliers WHERE id = p_supplier_id AND company_id = p_company_id;

  SELECT id INTO v_cash_ledger_id FROM ledgers WHERE company_id = p_company_id AND name = 'Cash' AND is_system = true;
  SELECT id INTO v_purchase_ledger_id FROM ledgers WHERE company_id = p_company_id AND name = 'Purchase Account' AND is_system = true;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_item_discount := COALESCE((v_item->>'discount_amount')::NUMERIC, 0);
    IF v_item_discount = 0 AND COALESCE((v_item->>'discount_percent')::NUMERIC, 0) > 0 THEN
      v_item_discount := ROUND((v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC * (v_item->>'discount_percent')::NUMERIC / 100, 2);
    END IF;
    v_item_amount := ROUND((v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC - v_item_discount, 2);
    v_subtotal := v_subtotal + v_item_amount;
  END LOOP;

  v_total := GREATEST(0, v_subtotal - p_discount_amount);

  INSERT INTO vouchers (
    company_id, financial_year_id, voucher_type, voucher_number,
    date, reference_number, party_id, party_type, party_name, narration,
    subtotal, discount_amount, total_amount, payment_mode,
    status, idempotency_key, created_by
  ) VALUES (
    p_company_id, p_financial_year_id, 'purchase', v_voucher_number,
    p_date, p_reference_number, p_supplier_id, 'supplier', v_supplier_name, p_narration,
    v_subtotal, p_discount_amount, v_total, p_payment_mode,
    'confirmed', COALESCE(p_idempotency_key, uuid_generate_v4()), auth.uid()
  )
  RETURNING id INTO v_voucher_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_sort_order := v_sort_order + 1;
    v_item_discount := COALESCE((v_item->>'discount_amount')::NUMERIC, 0);
    IF v_item_discount = 0 AND COALESCE((v_item->>'discount_percent')::NUMERIC, 0) > 0 THEN
      v_item_discount := ROUND((v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC * (v_item->>'discount_percent')::NUMERIC / 100, 2);
    END IF;
    v_item_amount := ROUND((v_item->>'quantity')::NUMERIC * (v_item->>'rate')::NUMERIC - v_item_discount, 2);

    INSERT INTO voucher_items (voucher_id, product_id, product_name, product_sku, unit_name, quantity, rate, discount_percent, discount_amount, amount, sort_order)
    VALUES (v_voucher_id, (v_item->>'product_id')::UUID, v_item->>'product_name', v_item->>'product_sku', v_item->>'unit_name',
      (v_item->>'quantity')::NUMERIC, (v_item->>'rate')::NUMERIC, COALESCE((v_item->>'discount_percent')::NUMERIC, 0), v_item_discount, v_item_amount, v_sort_order);

    IF (v_item->>'product_id') IS NOT NULL THEN
      INSERT INTO stock_movements (company_id, product_id, voucher_id, movement_type, quantity, rate, created_by)
      VALUES (p_company_id, (v_item->>'product_id')::UUID, v_voucher_id, 'purchase', ABS((v_item->>'quantity')::NUMERIC), (v_item->>'rate')::NUMERIC, auth.uid());
    END IF;
  END LOOP;

  -- Debit: Purchase Account
  INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
  VALUES (v_voucher_id, v_purchase_ledger_id, v_total, 0);

  -- Credit: Supplier or Cash
  IF p_payment_mode = 'credit' AND v_supplier_ledger_id IS NOT NULL THEN
    INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
    VALUES (v_voucher_id, v_supplier_ledger_id, 0, v_total);
  ELSE
    INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
    VALUES (v_voucher_id, v_cash_ledger_id, 0, v_total);
  END IF;

  INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, new_values)
  VALUES (p_company_id, auth.uid(), 'create', 'voucher', v_voucher_id,
    jsonb_build_object('voucher_type', 'purchase', 'voucher_number', v_voucher_number, 'total', v_total));

  RETURN jsonb_build_object('voucher_id', v_voucher_id, 'voucher_number', v_voucher_number, 'total_amount', v_total, 'duplicate', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CREATE RECEIPT (payment from customer)
-- ============================================================

CREATE OR REPLACE FUNCTION create_receipt(
  p_company_id UUID,
  p_financial_year_id UUID,
  p_date DATE,
  p_customer_id UUID,
  p_amount NUMERIC,
  p_payment_mode TEXT DEFAULT 'cash',
  p_reference_number TEXT DEFAULT NULL,
  p_narration TEXT DEFAULT NULL,
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher_id UUID;
  v_voucher_number TEXT;
  v_customer_name TEXT;
  v_customer_ledger_id UUID;
  v_cash_ledger_id UUID;
  v_existing_voucher_id UUID;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_voucher_id FROM vouchers WHERE idempotency_key = p_idempotency_key;
    IF v_existing_voucher_id IS NOT NULL THEN
      RETURN jsonb_build_object('voucher_id', v_existing_voucher_id, 'duplicate', true);
    END IF;
  END IF;

  v_voucher_number := next_voucher_number(p_company_id, p_financial_year_id, 'receipt');

  SELECT name, ledger_id INTO v_customer_name, v_customer_ledger_id
  FROM customers WHERE id = p_customer_id AND company_id = p_company_id;

  SELECT id INTO v_cash_ledger_id FROM ledgers WHERE company_id = p_company_id AND name = 'Cash' AND is_system = true;

  INSERT INTO vouchers (
    company_id, financial_year_id, voucher_type, voucher_number,
    date, reference_number, party_id, party_type, party_name, narration,
    subtotal, discount_amount, total_amount, payment_mode,
    status, idempotency_key, created_by
  ) VALUES (
    p_company_id, p_financial_year_id, 'receipt', v_voucher_number,
    p_date, p_reference_number, p_customer_id, 'customer', v_customer_name, p_narration,
    p_amount, 0, p_amount, p_payment_mode,
    'confirmed', COALESCE(p_idempotency_key, uuid_generate_v4()), auth.uid()
  )
  RETURNING id INTO v_voucher_id;

  -- Debit: Cash/Bank
  INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
  VALUES (v_voucher_id, v_cash_ledger_id, p_amount, 0);

  -- Credit: Customer ledger
  IF v_customer_ledger_id IS NOT NULL THEN
    INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
    VALUES (v_voucher_id, v_customer_ledger_id, 0, p_amount);
  END IF;

  INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, new_values)
  VALUES (p_company_id, auth.uid(), 'create', 'voucher', v_voucher_id,
    jsonb_build_object('voucher_type', 'receipt', 'voucher_number', v_voucher_number, 'amount', p_amount));

  RETURN jsonb_build_object('voucher_id', v_voucher_id, 'voucher_number', v_voucher_number, 'total_amount', p_amount, 'duplicate', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CREATE PAYMENT (payment to supplier)
-- ============================================================

CREATE OR REPLACE FUNCTION create_payment(
  p_company_id UUID,
  p_financial_year_id UUID,
  p_date DATE,
  p_supplier_id UUID,
  p_amount NUMERIC,
  p_payment_mode TEXT DEFAULT 'cash',
  p_reference_number TEXT DEFAULT NULL,
  p_narration TEXT DEFAULT NULL,
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher_id UUID;
  v_voucher_number TEXT;
  v_supplier_name TEXT;
  v_supplier_ledger_id UUID;
  v_cash_ledger_id UUID;
  v_existing_voucher_id UUID;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_voucher_id FROM vouchers WHERE idempotency_key = p_idempotency_key;
    IF v_existing_voucher_id IS NOT NULL THEN
      RETURN jsonb_build_object('voucher_id', v_existing_voucher_id, 'duplicate', true);
    END IF;
  END IF;

  v_voucher_number := next_voucher_number(p_company_id, p_financial_year_id, 'payment');

  SELECT name, ledger_id INTO v_supplier_name, v_supplier_ledger_id
  FROM suppliers WHERE id = p_supplier_id AND company_id = p_company_id;

  SELECT id INTO v_cash_ledger_id FROM ledgers WHERE company_id = p_company_id AND name = 'Cash' AND is_system = true;

  INSERT INTO vouchers (
    company_id, financial_year_id, voucher_type, voucher_number,
    date, reference_number, party_id, party_type, party_name, narration,
    subtotal, discount_amount, total_amount, payment_mode,
    status, idempotency_key, created_by
  ) VALUES (
    p_company_id, p_financial_year_id, 'payment', v_voucher_number,
    p_date, p_reference_number, p_supplier_id, 'supplier', v_supplier_name, p_narration,
    p_amount, 0, p_amount, p_payment_mode,
    'confirmed', COALESCE(p_idempotency_key, uuid_generate_v4()), auth.uid()
  )
  RETURNING id INTO v_voucher_id;

  -- Debit: Supplier ledger (reduces payable)
  IF v_supplier_ledger_id IS NOT NULL THEN
    INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
    VALUES (v_voucher_id, v_supplier_ledger_id, p_amount, 0);
  END IF;

  -- Credit: Cash/Bank
  INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
  VALUES (v_voucher_id, v_cash_ledger_id, 0, p_amount);

  INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, new_values)
  VALUES (p_company_id, auth.uid(), 'create', 'voucher', v_voucher_id,
    jsonb_build_object('voucher_type', 'payment', 'voucher_number', v_voucher_number, 'amount', p_amount));

  RETURN jsonb_build_object('voucher_id', v_voucher_id, 'voucher_number', v_voucher_number, 'total_amount', p_amount, 'duplicate', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CREATE EXPENSE
-- ============================================================

CREATE OR REPLACE FUNCTION create_expense(
  p_company_id UUID,
  p_financial_year_id UUID,
  p_date DATE,
  p_ledger_id UUID,
  p_amount NUMERIC,
  p_payment_mode TEXT DEFAULT 'cash',
  p_reference_number TEXT DEFAULT NULL,
  p_narration TEXT DEFAULT NULL,
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher_id UUID;
  v_voucher_number TEXT;
  v_ledger_name TEXT;
  v_cash_ledger_id UUID;
  v_existing_voucher_id UUID;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_voucher_id FROM vouchers WHERE idempotency_key = p_idempotency_key;
    IF v_existing_voucher_id IS NOT NULL THEN
      RETURN jsonb_build_object('voucher_id', v_existing_voucher_id, 'duplicate', true);
    END IF;
  END IF;

  v_voucher_number := next_voucher_number(p_company_id, p_financial_year_id, 'expense');

  SELECT name INTO v_ledger_name FROM ledgers WHERE id = p_ledger_id AND company_id = p_company_id;
  SELECT id INTO v_cash_ledger_id FROM ledgers WHERE company_id = p_company_id AND name = 'Cash' AND is_system = true;

  INSERT INTO vouchers (
    company_id, financial_year_id, voucher_type, voucher_number,
    date, reference_number, narration,
    subtotal, discount_amount, total_amount, payment_mode,
    status, idempotency_key, created_by
  ) VALUES (
    p_company_id, p_financial_year_id, 'expense', v_voucher_number,
    p_date, p_reference_number, COALESCE(p_narration, v_ledger_name),
    p_amount, 0, p_amount, p_payment_mode,
    'confirmed', COALESCE(p_idempotency_key, uuid_generate_v4()), auth.uid()
  )
  RETURNING id INTO v_voucher_id;

  -- Debit: Expense ledger
  INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
  VALUES (v_voucher_id, p_ledger_id, p_amount, 0);

  -- Credit: Cash/Bank
  INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
  VALUES (v_voucher_id, v_cash_ledger_id, 0, p_amount);

  INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, new_values)
  VALUES (p_company_id, auth.uid(), 'create', 'voucher', v_voucher_id,
    jsonb_build_object('voucher_type', 'expense', 'voucher_number', v_voucher_number, 'amount', p_amount));

  RETURN jsonb_build_object('voucher_id', v_voucher_id, 'voucher_number', v_voucher_number, 'total_amount', p_amount, 'duplicate', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CANCEL VOUCHER
-- ============================================================

CREATE OR REPLACE FUNCTION cancel_voucher(
  p_voucher_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_voucher RECORD;
BEGIN
  SELECT * INTO v_voucher FROM vouchers WHERE id = p_voucher_id;

  IF v_voucher IS NULL THEN
    RAISE EXCEPTION 'Voucher not found';
  END IF;

  IF v_voucher.status = 'cancelled' THEN
    RAISE EXCEPTION 'Voucher is already cancelled';
  END IF;

  -- Record old values for audit
  INSERT INTO audit_logs (company_id, user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (v_voucher.company_id, auth.uid(), 'cancel', 'voucher', p_voucher_id,
    jsonb_build_object('status', v_voucher.status),
    jsonb_build_object('status', 'cancelled', 'reason', p_reason));

  -- Cancel the voucher
  UPDATE vouchers
  SET status = 'cancelled',
      cancelled_by = auth.uid(),
      cancelled_at = NOW(),
      cancel_reason = p_reason
  WHERE id = p_voucher_id;

  -- Reverse stock movements
  INSERT INTO stock_movements (company_id, product_id, voucher_id, movement_type, quantity, rate, reference, created_by)
  SELECT company_id, product_id, voucher_id,
    CASE movement_type
      WHEN 'sale' THEN 'adjustment'
      WHEN 'purchase' THEN 'adjustment'
      WHEN 'sales_return' THEN 'adjustment'
      WHEN 'purchase_return' THEN 'adjustment'
      ELSE 'adjustment'
    END,
    -quantity, -- reverse the movement
    rate,
    'Reversal: voucher cancelled',
    auth.uid()
  FROM stock_movements
  WHERE voucher_id = p_voucher_id;

  -- Reverse ledger entries (swap debit/credit)
  INSERT INTO voucher_ledger_entries (voucher_id, ledger_id, debit, credit)
  SELECT voucher_id, ledger_id, credit, debit -- swapped
  FROM voucher_ledger_entries
  WHERE voucher_id = p_voucher_id;

  RETURN jsonb_build_object('success', true, 'voucher_id', p_voucher_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- COMPANY SETUP (creates company + default data)
-- ============================================================

CREATE OR REPLACE FUNCTION setup_company(
  p_name TEXT,
  p_books_beginning_date DATE,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_company_id UUID;
  v_fy_id UUID;
  v_user_id UUID := auth.uid();
  v_fy_start DATE;
  v_fy_end DATE;
  v_fy_name TEXT;
  v_role_id UUID;
  v_group_id UUID;
  v_parent_group_id UUID;
BEGIN
  -- Create company
  INSERT INTO companies (name, address, city, state, phone, email, books_beginning_date)
  VALUES (p_name, p_address, p_city, p_state, p_phone, p_email, p_books_beginning_date)
  RETURNING id INTO v_company_id;

  -- Create financial year
  v_fy_start := CASE
    WHEN EXTRACT(MONTH FROM p_books_beginning_date) >= 4
    THEN DATE_TRUNC('year', p_books_beginning_date) + INTERVAL '3 months'
    ELSE DATE_TRUNC('year', p_books_beginning_date) - INTERVAL '9 months'
  END;
  v_fy_end := v_fy_start + INTERVAL '1 year' - INTERVAL '1 day';
  v_fy_name := EXTRACT(YEAR FROM v_fy_start)::TEXT || '-' || RIGHT(EXTRACT(YEAR FROM v_fy_end)::TEXT, 2);

  INSERT INTO financial_years (company_id, name, start_date, end_date, is_active)
  VALUES (v_company_id, v_fy_name, v_fy_start, v_fy_end, true)
  RETURNING id INTO v_fy_id;

  -- Update user profile with company
  UPDATE profiles SET company_id = v_company_id WHERE id = v_user_id;

  -- Create default roles
  INSERT INTO roles (company_id, name, display_name, description, is_system) VALUES
    (v_company_id, 'admin', 'Administrator', 'Full access to all features', true),
    (v_company_id, 'manager', 'Manager', 'Full access except company settings', true),
    (v_company_id, 'accountant', 'Accountant', 'Ledgers, payments, receipts, reports', true),
    (v_company_id, 'billing_staff', 'Billing Staff', 'Sales, receipts, view products', true),
    (v_company_id, 'viewer', 'Viewer', 'Read-only access', true);

  -- Assign admin role to creator
  SELECT id INTO v_role_id FROM roles WHERE company_id = v_company_id AND name = 'admin';
  INSERT INTO user_roles (user_id, role_id, company_id) VALUES (v_user_id, v_role_id, v_company_id);

  -- Create default ledger groups
  -- Primary groups
  INSERT INTO ledger_groups (company_id, name, nature, is_system) VALUES
    (v_company_id, 'Capital Account', 'capital', true),
    (v_company_id, 'Current Assets', 'assets', true),
    (v_company_id, 'Fixed Assets', 'assets', true),
    (v_company_id, 'Current Liabilities', 'liabilities', true),
    (v_company_id, 'Direct Income', 'income', true),
    (v_company_id, 'Indirect Income', 'income', true),
    (v_company_id, 'Direct Expenses', 'expense', true),
    (v_company_id, 'Indirect Expenses', 'expense', true);

  -- Sub-groups
  SELECT id INTO v_parent_group_id FROM ledger_groups WHERE company_id = v_company_id AND name = 'Current Assets';
  INSERT INTO ledger_groups (company_id, name, parent_id, nature, is_system) VALUES
    (v_company_id, 'Cash-in-Hand', v_parent_group_id, 'assets', true),
    (v_company_id, 'Bank Accounts', v_parent_group_id, 'assets', true),
    (v_company_id, 'Sundry Debtors', v_parent_group_id, 'assets', true);

  SELECT id INTO v_parent_group_id FROM ledger_groups WHERE company_id = v_company_id AND name = 'Current Liabilities';
  INSERT INTO ledger_groups (company_id, name, parent_id, nature, is_system) VALUES
    (v_company_id, 'Sundry Creditors', v_parent_group_id, 'liabilities', true);

  -- Create default ledgers
  SELECT id INTO v_group_id FROM ledger_groups WHERE company_id = v_company_id AND name = 'Cash-in-Hand';
  INSERT INTO ledgers (company_id, group_id, name, is_system) VALUES (v_company_id, v_group_id, 'Cash', true);

  SELECT id INTO v_group_id FROM ledger_groups WHERE company_id = v_company_id AND name = 'Direct Income';
  INSERT INTO ledgers (company_id, group_id, name, is_system) VALUES (v_company_id, v_group_id, 'Sales Account', true);

  SELECT id INTO v_group_id FROM ledger_groups WHERE company_id = v_company_id AND name = 'Direct Expenses';
  INSERT INTO ledgers (company_id, group_id, name, is_system) VALUES (v_company_id, v_group_id, 'Purchase Account', true);

  -- Create default units
  INSERT INTO units (company_id, name, symbol, decimal_places) VALUES
    (v_company_id, 'Pieces', 'Pcs', 0),
    (v_company_id, 'Kilograms', 'Kg', 3),
    (v_company_id, 'Grams', 'g', 0),
    (v_company_id, 'Litres', 'Ltr', 3),
    (v_company_id, 'Metres', 'm', 2),
    (v_company_id, 'Boxes', 'Box', 0),
    (v_company_id, 'Dozens', 'Doz', 0),
    (v_company_id, 'Packets', 'Pkt', 0),
    (v_company_id, 'Numbers', 'Nos', 0);

  RETURN jsonb_build_object(
    'company_id', v_company_id,
    'financial_year_id', v_fy_id,
    'message', 'Company setup complete'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
