import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { calculateBillTotals } from '@agre/shared/calculations/billing';
import { formatCurrency } from '@agre/shared/utils/currency';
import { formatDateLong } from '@agre/shared/utils/date';
import type { VoucherItemInput, PaymentMode } from '@agre/shared/types';
import { A4Invoice } from '../../components/InvoiceTemplates';
import Autocomplete, { type AutocompleteOption } from '../../components/Autocomplete';
import { useMasters } from '../../stores/mastersStore';

interface CartItem extends VoucherItemInput {
  _key: string;
  unit: string;
}

export default function SaleVoucherPage() {
  const navigate = useNavigate();
  const { customers, products } = useMasters();
  const [voucherNo, setVoucherNo] = useState('SAL/000001');
  const [partyName, setPartyName] = useState('');
  const [partyBalance, setPartyBalance] = useState('0.00');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [narration, setNarration] = useState('Being goods sold.');
  const [billDiscount, setBillDiscount] = useState(0);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const [items, setItems] = useState<CartItem[]>([
    { _key: '1', product_name: '', quantity: 1, rate: 0, unit: 'pcs', discount_percent: 0, discount_amount: 0 },
  ]);

  const itemRef = useRef<HTMLInputElement>(null);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { _key: Date.now().toString(), product_name: '', quantity: 1, rate: 0, unit: 'pcs', discount_percent: 0, discount_amount: 0 },
    ]);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i._key !== key));
  }, []);

  const updateItem = useCallback((key: string, field: keyof CartItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item._key === key ? { ...item, [field]: value } : item))
    );
  }, []);

  // Master-data suggestions
  const customerOptions = useMemo<AutocompleteOption[]>(
    () =>
      customers.map((c) => ({
        label: c.name,
        sublabel: c.phone || c.city || '',
        value: c.id,
        data: c,
      })),
    [customers]
  );

  const productOptions = useMemo<AutocompleteOption[]>(
    () =>
      products.map((p) => ({
        label: p.name,
        sublabel: `${formatCurrency(p.selling_price, '')}${p.unit_symbol ? ' / ' + p.unit_symbol : ''}`,
        value: p.id,
        data: p,
      })),
    [products]
  );

  const selectCustomer = useCallback((opt: AutocompleteOption) => {
    setPartyName(opt.label);
    setPartyBalance(formatCurrency(opt.data?.outstanding_balance ?? 0, ''));
  }, []);

  // When a product is picked, auto-fill its selling rate and unit.
  const selectProduct = useCallback((key: string, opt: AutocompleteOption) => {
    const p = opt.data;
    setItems((prev) =>
      prev.map((item) =>
        item._key === key
          ? {
              ...item,
              product_name: opt.label,
              rate: p?.selling_price || item.rate,
              unit: p?.unit_symbol || item.unit,
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
      setShowPrintModal(true);
    }, 500);
  }, [validItems]);

  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: handleSave, description: 'Save' },
    { key: 'a', ctrl: true, action: handleSave, description: 'Accept' },
    { key: 'p', ctrl: true, action: () => setShowPrintModal(true), description: 'Print' },
    { key: 'Escape', action: () => (showPreview ? setShowPreview(false) : showPrintModal ? setShowPrintModal(false) : navigate('/')), description: 'Back' },
  ]);

  return (
    <div className="tp-voucher-frame">
      {/* Top Voucher Info */}
      <div className="tp-voucher-top-info" style={{ padding: '0 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 'bold', fontSize: 13, color: '#093970', textTransform: 'uppercase' }}>Sales</span>
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
          {saved && <span style={{ color: '#15803d', fontWeight: 'bold' }}>✓ Saved Successfully</span>}
          <span style={{ fontWeight: 600, fontSize: 12 }}>{formatDateLong(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Party Details */}
      <div className="tp-voucher-party-row" style={{ marginTop: 8, padding: '0 8px' }}>
        <span className="tp-party-label">Party A/c name</span>
        <span className="tp-colon">:</span>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <Autocomplete
            className="tp-party-input"
            style={{ width: '100%' }}
            value={partyName}
            onChange={setPartyName}
            onSelect={selectCustomer}
            options={customerOptions}
            placeholder="Select customer or Walk-in"
          />
        </div>
        <span className="tp-party-balance">Current balance : {partyBalance}</span>
      </div>

      <div className="tp-voucher-party-row" style={{ padding: '0 8px' }}>
        <span className="tp-party-label">Payment Mode</span>
        <span className="tp-colon">:</span>
        <select
          className="tp-party-input"
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
          style={{ maxWidth: 160 }}
        >
          <option value="cash">Cash</option>
          <option value="credit">Credit (Sundry Debtor)</option>
          <option value="upi">UPI / Online</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Items Table */}
      <div className="tp-voucher-grid" style={{ flex: 1, minHeight: 220 }}>
        <div className="tp-grid-header">
          <div style={{ flex: 1, paddingLeft: 8 }}>Name of Item</div>
          <div style={{ width: 90, textAlign: 'right' }}>Quantity</div>
          <div style={{ width: 110, textAlign: 'right' }}>Rate</div>
          <div style={{ width: 60, textAlign: 'center' }}>per</div>
          <div style={{ width: 80, textAlign: 'right' }}>Disc %</div>
          <div style={{ width: 120, textAlign: 'right', paddingRight: 8 }}>Amount</div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {items.map((item, index) => {
            const result = totals.itemResults[validItems.findIndex((vi) =>
              vi.product_name === item.product_name && vi.quantity === item.quantity && vi.rate === item.rate
            )];
            const lineAmount = result?.amount ?? (item.quantity && item.rate ? item.quantity * item.rate : 0);

            return (
              <div key={item._key} className="tp-grid-row">
                <div style={{ flex: 1, paddingRight: 8 }}>
                  <Autocomplete
                    inputRef={index === items.length - 1 ? itemRef : undefined}
                    className="tp-grid-input"
                    style={{ width: '100%', fontWeight: item.product_name ? 600 : 'normal' }}
                    placeholder="Type item name..."
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
                    style={{ textAlign: 'right', width: '100%' }}
                    value={item.quantity || ''}
                    onChange={(e) => updateItem(item._key, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div style={{ width: 110, textAlign: 'right' }}>
                  <input
                    type="number"
                    className="tp-grid-input"
                    style={{ textAlign: 'right', width: '100%' }}
                    value={item.rate || ''}
                    onChange={(e) => updateItem(item._key, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div style={{ width: 60, textAlign: 'center', fontSize: 11, fontWeight: 600 }}>
                  {item.unit || 'pcs'}
                </div>
                <div style={{ width: 80, textAlign: 'right' }}>
                  <input
                    type="number"
                    className="tp-grid-input"
                    style={{ textAlign: 'right', width: '100%' }}
                    value={item.discount_percent || ''}
                    onChange={(e) => updateItem(item._key, 'discount_percent', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div style={{ width: 120, textAlign: 'right', paddingRight: 8, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {lineAmount > 0 ? lineAmount.toFixed(2) : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narration & Voucher Totals */}
      <div className="tp-voucher-bottom">
        <div className="tp-narration-box">
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Narration:</div>
          <input
            type="text"
            className="tp-narration-input"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
          <div style={{ marginTop: 8 }}>
            <button
              data-save="true"
              className="tp-btn primary"
              onClick={handleSave}
              style={{ marginRight: 6 }}
            >
              Accept (Ctrl+A)
            </button>
            <button className="tp-btn" onClick={() => setShowPrintModal(true)}>
              Print (Ctrl+P)
            </button>
            <button className="tp-btn" onClick={addItem} style={{ marginLeft: 6 }}>
              + Add Line
            </button>
          </div>
        </div>

        <div className="tp-total-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span>Subtotal:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {formatCurrency(totals.subtotal, '')}
            </span>
          </div>
          {totals.itemDiscountTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#b91c1c' }}>
              <span>Item Discount:</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>
                −{formatCurrency(totals.itemDiscountTotal, '')}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
            <span>Bill Discount:</span>
            <input
              type="number"
              style={{ width: 70, textAlign: 'right', border: '1px solid #94bde0', padding: '1px 4px' }}
              value={billDiscount || ''}
              onChange={(e) => setBillDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="tp-grand-total">
            <span style={{ fontSize: 13, fontWeight: 700, marginRight: 12 }}>TOTAL:</span>
            <span>₹{formatCurrency(totals.grandTotal, '')}</span>
          </div>
        </div>
      </div>

      {/* TallyPrime Print Modal Dialog (Screenshot Match) */}
      {showPrintModal && (
        <div className="tp-modal-overlay" onClick={() => setShowPrintModal(false)}>
          <div className="tp-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tp-modal-title">
              <span>Print Voucher / Tax Invoice</span>
              <span style={{ cursor: 'pointer' }} onClick={() => setShowPrintModal(false)}>✕</span>
            </div>
            <div className="tp-modal-body">
              <div className="tp-modal-row">
                <div className="tp-modal-row-label">Template Name</div>
                <div className="tp-modal-row-val">: ◆ Agre Classic Tax Invoice</div>
              </div>
              <div className="tp-modal-row">
                <div className="tp-modal-row-label">Title</div>
                <div className="tp-modal-row-val">: Tax Invoice / Bill</div>
              </div>
              <div className="tp-modal-row">
                <div className="tp-modal-row-label">Printer</div>
                <div className="tp-modal-row-val">: System Default / Thermal 58mm</div>
              </div>
              <div className="tp-modal-row">
                <div className="tp-modal-row-label">Paper Size</div>
                <div className="tp-modal-row-val">: A4 (8.27" x 11.69") or Thermal</div>
              </div>
              <div className="tp-modal-row">
                <div className="tp-modal-row-label">Number of Copies</div>
                <div className="tp-modal-row-val">: 1</div>
              </div>
            </div>
            <div className="tp-modal-footer">
              <button className="tp-btn" onClick={() => alert('Printer Settings')}>
                <span style={{ textDecoration: 'underline' }}>C</span>: Configure
              </button>
              <button className="tp-btn" onClick={() => setShowPreview(true)}>
                <span style={{ textDecoration: 'underline' }}>I</span>: Preview
              </button>
              <button className="tp-btn primary" onClick={() => window.print()}>
                <span style={{ textDecoration: 'underline' }}>P</span>: Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Popup */}
      {showPreview && (
        <div className="tp-modal-overlay" onClick={() => setShowPreview(false)}>
          <div style={{ background: '#ffffff', width: '850px', maxHeight: '90vh', overflow: 'auto', padding: 20, boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <button className="tp-btn primary" onClick={() => window.print()}>Print Invoice (Ctrl+P)</button>
              <button className="tp-btn" onClick={() => setShowPreview(false)}>Close Preview (Esc)</button>
            </div>
            <A4Invoice
              voucher={{
                voucher_number: voucherNo,
                date: new Date().toISOString(),
                party_name: partyName,
                payment_mode: paymentMode,
                subtotal: totals.subtotal,
                discount_amount: billDiscount + totals.itemDiscountTotal,
                total_amount: totals.grandTotal,
                items: validItems.map((i, idx) => ({
                  id: i._key,
                  voucher_id: 'v1',
                  product_name: i.product_name,
                  quantity: i.quantity,
                  rate: i.rate,
                  discount_amount: i.discount_amount || 0,
                  discount_percent: i.discount_percent || 0,
                  amount: i.quantity * i.rate - (i.discount_amount || 0),
                  sort_order: idx,
                  created_at: new Date().toISOString(),
                })),
              }}
              company={{
                name: 'Agre Machinery And Hardware Stores',
                address: 'Main Market Road',
                city: 'Pune',
                state: 'Maharashtra',
                phone: '9822001122',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
