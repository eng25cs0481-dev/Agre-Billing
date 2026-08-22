import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { calculateBillTotals } from '@agre/shared/calculations/billing';
import { formatCurrency } from '@agre/shared/utils/currency';
import { formatDateLong } from '@agre/shared/utils/date';
import type { VoucherItemInput, PaymentMode } from '@agre/shared/types';
import { A4Invoice } from '../../components/InvoiceTemplates';

interface CartItem extends VoucherItemInput {
  _key: string;
  unit: string;
}

export default function SaleVoucherPage() {
  const navigate = useNavigate();
  const [voucherNo, setVoucherNo] = useState('SAL/000001');
  const [partyName, setPartyName] = useState('');
  const [partyBalance] = useState('0.00');
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
      <div className="tp-voucher-top-info">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="tp-voucher-badge">Sales</span>
          <span style={{ marginRight: 6, fontWeight: 'bold' }}>No.</span>
          <input
            type="text"
            className="tp-voucher-no-input"
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            style={{ width: 130 }}
          />
        </div>
        <div>
          {saved && <span style={{ color: '#15803d', fontWeight: 'bold', marginRight: 12 }}>✓ Saved Successfully</span>}
          <span style={{ fontWeight: 600 }}>{formatDateLong(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Party Details */}
      <div className="tp-voucher-party-row" style={{ marginTop: 8 }}>
        <span className="tp-party-label">Party A/c name</span>
        <span style={{ marginRight: 6 }}>:</span>
        <input
          type="text"
          className="tp-party-input"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          placeholder="Select customer or Walk-in"
        />
        <span className="tp-party-balance">Current balance : {partyBalance}</span>
      </div>

      <div className="tp-voucher-party-row">
        <span className="tp-party-label">Payment Mode</span>
        <span style={{ marginRight: 6 }}>:</span>
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
      <div className="tp-table-wrap">
        <table className="tp-table">
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Name of Item</th>
              <th style={{ width: '12%' }} className="num">Quantity</th>
              <th style={{ width: '14%' }} className="num">Rate</th>
              <th style={{ width: '8%' }}>per</th>
              <th style={{ width: '9%' }} className="num">Disc %</th>
              <th style={{ width: '12%' }} className="num">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const result = totals.itemResults[validItems.findIndex((vi) =>
                vi.product_name === item.product_name && vi.quantity === item.quantity && vi.rate === item.rate
              )];
              const lineAmount = result?.amount ?? (item.quantity && item.rate ? item.quantity * item.rate : 0);

              return (
                <tr key={item._key} className={index === items.length - 1 ? 'selected' : ''}>
                  <td>
                    <input
                      ref={index === items.length - 1 ? itemRef : undefined}
                      type="text"
                      style={{
                        width: '100%',
                        border: 'none',
                        background: 'transparent',
                        fontWeight: item.product_name ? 600 : 'normal',
                        outline: 'none',
                      }}
                      placeholder="Type item name..."
                      value={item.product_name}
                      onChange={(e) => updateItem(item._key, 'product_name', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addItem();
                      }}
                    />
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      style={{ width: '70px', textAlign: 'right', border: 'none', background: 'transparent', outline: 'none' }}
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item._key, 'quantity', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      style={{ width: '80px', textAlign: 'right', border: 'none', background: 'transparent', outline: 'none' }}
                      value={item.rate || ''}
                      onChange={(e) => updateItem(item._key, 'rate', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td>{item.unit || 'pcs'}</td>
                  <td className="num">
                    <input
                      type="number"
                      style={{ width: '50px', textAlign: 'right', border: 'none', background: 'transparent', outline: 'none' }}
                      value={item.discount_percent || ''}
                      onChange={(e) => updateItem(item._key, 'discount_percent', parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="num" style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {lineAmount > 0 ? lineAmount.toFixed(2) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
              Accept (^A)
            </button>
            <button className="tp-btn" onClick={() => setShowPrintModal(true)}>
              Print (^P)
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
              <button className="tp-btn primary" onClick={() => window.print()}>Print Invoice (^P)</button>
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
