import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, X, Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { calculateBillTotals } from '@agre/shared/calculations/billing';
import { formatCurrency } from '@agre/shared/utils/currency';
import { formatDateLong } from '@agre/shared/utils/date';
import type { VoucherItemInput, PaymentMode } from '@agre/shared/types';
import Autocomplete, { type AutocompleteOption } from '../../components/Autocomplete';
import { useMasters } from '../../stores/mastersStore';

interface CartItem extends VoucherItemInput {
  _key: string;
  unit?: string;
}

export default function PurchaseVoucherPage() {
  const navigate = useNavigate();
  const { suppliers, products } = useMasters();

  const [voucherNo, setVoucherNo] = useState('PUR-0001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierInvNo, setSupplierInvNo] = useState('');
  const [supplierInvDate, setSupplierInvDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('credit');
  const [narration, setNarration] = useState('');
  const [billDiscount, setBillDiscount] = useState(0);
  const [items, setItems] = useState<CartItem[]>([
    { _key: '1', product_name: '', quantity: 1, rate: 0, discount_percent: 0, discount_amount: 0, unit: 'PCS' },
  ]);
  const [saved, setSaved] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);

  const supplierInputRef = useRef<HTMLInputElement>(null);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { _key: Date.now().toString(), product_name: '', quantity: 1, rate: 0, discount_percent: 0, discount_amount: 0, unit: 'PCS' },
    ]);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((i) => i._key !== key) : prev));
  }, []);

  const updateItem = useCallback((key: string, field: keyof CartItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item._key === key ? { ...item, [field]: value } : item))
    );
  }, []);

  const supplierOptions = useMemo<AutocompleteOption[]>(
    () =>
      suppliers.map((s) => ({
        label: s.name,
        sublabel: s.phone || s.city || '',
        value: s.id,
        data: s,
      })),
    [suppliers]
  );

  const productOptions = useMemo<AutocompleteOption[]>(
    () =>
      products.map((p) => ({
        label: p.name,
        sublabel: `${formatCurrency(p.cost_price, '')}${p.unit_symbol ? ' / ' + p.unit_symbol : ''}`,
        value: p.id,
        data: p,
      })),
    [products]
  );

  // When a product is picked, auto-fill its cost rate and unit
  const selectProduct = useCallback((key: string, opt: AutocompleteOption) => {
    const p = opt.data;
    setItems((prev) =>
      prev.map((item) =>
        item._key === key
          ? {
              ...item,
              product_name: opt.label,
              rate: p?.cost_price || item.rate,
              unit: p?.unit_symbol || item.unit || 'PCS',
            }
          : item
      )
    );
  }, []);

  const validItems = items.filter((i) => i.product_name && i.quantity > 0 && i.rate > 0);
  const totals = calculateBillTotals(validItems, billDiscount);

  const handleSave = useCallback(() => {
    if (validItems.length === 0) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setShowAcceptModal(false);
    }, 1200);
  }, [validItems]);

  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: handleSave, description: 'Save' },
    { key: 'a', ctrl: true, action: handleSave, description: 'Accept' },
    { key: 'Escape', action: () => (showAcceptModal ? setShowAcceptModal(false) : navigate('/')), description: 'Back' },
  ]);

  return (
    <div className="tp-voucher-frame">
      {/* Top Header & Voucher No */}
      <div className="tp-voucher-top-info" style={{ padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 'bold', fontSize: 13, color: '#093970', textTransform: 'uppercase' }}>Purchase</span>
          <div>
            <span style={{ fontWeight: 'bold', fontSize: 12, color: '#093970' }}>No.</span>
            <input
              type="text"
              className="tp-voucher-no-input"
              value={voucherNo}
              onChange={(e) => setVoucherNo(e.target.value)}
              style={{ width: 130, marginLeft: 6 }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: 12 }}>✓ Saved Successfully</span>}
          <span style={{ fontWeight: 600, fontSize: 12 }}>{formatDateLong(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Supplier Reference & Invoice Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8, padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 150, fontSize: 12, fontWeight: 600, color: '#1e3a8a' }}>Supplier Inv No.</span>
          <span style={{ marginRight: 8 }}>:</span>
          <input
            type="text"
            className="tp-party-input"
            placeholder="Invoice / Ref No."
            value={supplierInvNo}
            onChange={(e) => setSupplierInvNo(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 60, fontSize: 12, fontWeight: 600, color: '#1e3a8a' }}>Date</span>
          <span style={{ marginRight: 8 }}>:</span>
          <input
            type="date"
            className="tp-party-input"
            value={supplierInvDate}
            onChange={(e) => setSupplierInvDate(e.target.value)}
            style={{ width: 140 }}
          />
        </div>
      </div>

      {/* Supplier Party Details */}
      <div className="tp-voucher-party-row" style={{ marginTop: 8, padding: '0 8px' }}>
        <span className="tp-party-label">Party A/c name</span>
        <span className="tp-colon">:</span>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <Autocomplete
            inputRef={supplierInputRef}
            className="tp-party-input"
            style={{ width: '100%' }}
            placeholder="Select Supplier or Sundry Creditor..."
            value={supplierName}
            options={supplierOptions}
            onChange={setSupplierName}
            onSelect={(opt) => {
              setSupplierName(opt.label);
              if (opt.data?.address) setSupplierAddress(opt.data.address);
            }}
          />
        </div>
        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: '#64748b' }}>Mode:</span>
          <select
            className="tp-party-input"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
          >
            <option value="credit">Credit</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="upi">UPI / Online</option>
          </select>
        </div>
      </div>

      {/* Purchase Ledger Row */}
      <div className="tp-voucher-party-row" style={{ padding: '0 8px' }}>
        <span className="tp-party-label">Purchase ledger</span>
        <span className="tp-colon">:</span>
        <input
          type="text"
          className="tp-party-input"
          readOnly
          value="Purchase Accounts"
          style={{ width: 220, color: '#093970', fontWeight: 600 }}
        />
      </div>

      {/* TallyPrime Items Grid Table */}
      <div className="tp-voucher-grid" style={{ flex: 1, minHeight: 220 }}>
        {/* Table Header */}
        <div className="tp-grid-header">
          <div style={{ width: 40, textAlign: 'center' }}>#</div>
          <div style={{ flex: 1, textAlign: 'left', paddingLeft: 8 }}>Name of Item</div>
          <div style={{ width: 90, textAlign: 'right' }}>Quantity</div>
          <div style={{ width: 110, textAlign: 'right' }}>Rate (₹)</div>
          <div style={{ width: 60, textAlign: 'center' }}>per</div>
          <div style={{ width: 80, textAlign: 'right' }}>Disc %</div>
          <div style={{ width: 120, textAlign: 'right', paddingRight: 8 }}>Amount (₹)</div>
          <div style={{ width: 40, textAlign: 'center' }}></div>
        </div>

        {/* Item Rows */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {items.map((item, index) => {
            const lineAmt = item.quantity * item.rate * (1 - (item.discount_percent || 0) / 100);

            return (
              <div key={item._key} className="tp-grid-row">
                <div style={{ width: 40, textAlign: 'center', color: '#64748b', fontSize: 11.5 }}>{index + 1}</div>
                <div style={{ flex: 1, paddingRight: 8 }}>
                  <Autocomplete
                    className="tp-grid-input"
                    style={{ width: '100%', textAlign: 'left', fontWeight: 'bold' }}
                    placeholder="Enter item description..."
                    value={item.product_name}
                    options={productOptions}
                    onChange={(v) => updateItem(item._key, 'product_name', v)}
                    onSelect={(opt) => selectProduct(item._key, opt)}
                    onEnter={addItem}
                  />
                </div>
                <div style={{ width: 90, textAlign: 'right' }}>
                  <input
                    type="number"
                    className="tp-grid-input"
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item._key, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="any"
                    style={{ textAlign: 'right', width: '100%' }}
                  />
                </div>
                <div style={{ width: 110, textAlign: 'right' }}>
                  <input
                    type="number"
                    className="tp-grid-input"
                    value={item.rate || ''}
                    onChange={(e) => updateItem(item._key, 'rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="any"
                    style={{ textAlign: 'right', width: '100%' }}
                  />
                </div>
                <div style={{ width: 60, textAlign: 'center', fontSize: 11, color: '#475569', fontWeight: 600 }}>
                  {item.unit || 'PCS'}
                </div>
                <div style={{ width: 80, textAlign: 'right' }}>
                  <input
                    type="number"
                    className="tp-grid-input"
                    value={item.discount_percent || ''}
                    onChange={(e) => updateItem(item._key, 'discount_percent', parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    style={{ textAlign: 'right', width: '100%' }}
                  />
                </div>
                <div style={{ width: 120, textAlign: 'right', paddingRight: 8, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
                  {lineAmt > 0 ? formatCurrency(lineAmt, '') : '0.00'}
                </div>
                <div style={{ width: 40, textAlign: 'center' }}>
                  {items.length > 1 && (
                    <button
                      className="tp-btn danger"
                      style={{ padding: '2px 4px', fontSize: 10 }}
                      onClick={() => removeItem(item._key)}
                      title="Remove Row"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Row Bar */}
        <div style={{ padding: '4px 8px', borderTop: '1px dashed #cadfe8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="tp-btn" onClick={addItem} style={{ fontSize: 11 }}>
            <Plus size={11} style={{ marginRight: 4 }} /> + Add Line Item
          </button>
          <span style={{ fontSize: 10.5, color: '#64748b' }}>Tip: Press Enter in the Item name field to add a new line</span>
        </div>
      </div>

      {/* Narration and Totals Section */}
      <div className="tp-totals-section">
        <div style={{ flex: 1, paddingRight: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#0c3c78', width: 80 }}>Narration:</span>
            <input
              type="text"
              className="tp-party-input"
              style={{ flex: 1, fontSize: 12 }}
              placeholder="Enter purchase voucher narration or notes..."
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
            />
          </div>
        </div>

        {/* Calculation Summary Box */}
        <div style={{ width: 280, borderLeft: '1px solid #cadfe8', paddingLeft: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ color: '#475569' }}>Sub Total</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.itemDiscountTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: '#b91c1c', marginBottom: 4 }}>
              <span>Item Discount</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>- {formatCurrency(totals.itemDiscountTotal)}</span>
            </div>
          )}
          <div className="tp-grand-total" style={{ borderTop: '2px solid #0c3c78', paddingTop: 4, marginTop: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78' }}>TOTAL PURCHASE</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#0c3c78', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totals.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Ribbon */}
      <div className="tp-bottom-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="tp-btn primary" onClick={handleSave} disabled={validItems.length === 0}>
            Save Purchase (Ctrl+A)
          </button>
          <button className="tp-btn" onClick={() => window.print()}>
            <Printer size={12} style={{ marginRight: 4 }} /> Print Voucher
          </button>
        </div>
        <div>
          <button className="tp-btn danger" onClick={() => navigate('/')}>
            Cancel (Esc)
          </button>
        </div>
      </div>

      {/* TallyPrime Accept Dialog */}
      {showAcceptModal && (
        <div className="tp-accept-overlay">
          <div className="tp-accept-box">
            <h3 style={{ fontSize: 13, fontWeight: 'bold', color: '#0c3c78', marginBottom: 8 }}>Accept?</h3>
            <p style={{ fontSize: 11.5, color: '#334155', marginBottom: 12 }}>Save Purchase Voucher {voucherNo} for {formatCurrency(totals.grandTotal)}?</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button className="tp-btn primary" onClick={handleSave} autoFocus>
                Yes (Enter)
              </button>
              <button className="tp-btn" onClick={() => setShowAcceptModal(false)}>
                No (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
