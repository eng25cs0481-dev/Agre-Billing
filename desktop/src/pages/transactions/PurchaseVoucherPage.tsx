import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Printer, Plus, X } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { calculateBillTotals } from '@agre/shared/calculations/billing';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { VoucherItemInput, PaymentMode } from '@agre/shared/types';
import { PAYMENT_MODE_LABELS } from '@agre/shared/constants';

interface CartItem extends VoucherItemInput {
  _key: string;
}

export default function PurchaseVoucherPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('credit');
  const [narration, setNarration] = useState('');
  const [billDiscount, setBillDiscount] = useState(0);
  const [items, setItems] = useState<CartItem[]>([
    { _key: '1', product_name: '', quantity: 1, rate: 0, discount_percent: 0, discount_amount: 0 },
  ]);
  const [saved, setSaved] = useState(false);

  const itemRef = useRef<HTMLInputElement>(null);

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { _key: Date.now().toString(), product_name: '', quantity: 1, rate: 0, discount_percent: 0, discount_amount: 0 },
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
    setTimeout(() => setSaved(false), 2000);
  }, [validItems]);

  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: handleSave, description: 'Save' },
    { key: 'Escape', action: () => navigate('/'), description: 'Back' },
  ]);

  return (
    <div className="voucher-form" style={{ height: '100%' }}>
      <div className="voucher-header">
        <span className="voucher-title">Purchase Voucher</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-xs)' }}>✓ Saved</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>F9</span>
        </div>
      </div>

      <div className="voucher-meta">
        <div className="voucher-field">
          <label>Date</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ width: 150 }}
          />
        </div>
        <div className="voucher-field" style={{ flex: 1 }}>
          <label>Supplier</label>
          <input
            type="text"
            className="form-input"
            placeholder="Select or enter Supplier Name..."
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
          />
        </div>
        <div className="voucher-field">
          <label>Supplier Inv No.</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ref No."
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            style={{ width: 140 }}
          />
        </div>
        <div className="voucher-field">
          <label>Payment Mode</label>
          <select
            className="form-select"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
            style={{ width: 130 }}
          >
            {Object.entries(PAYMENT_MODE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="voucher-items">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Product Name</th>
              <th style={{ width: '90px' }} className="num">Qty</th>
              <th style={{ width: '110px' }} className="num">Rate (₹)</th>
              <th style={{ width: '90px' }} className="num">Disc %</th>
              <th style={{ width: '110px' }} className="num">Disc Amt</th>
              <th style={{ width: '120px' }} className="num">Amount (₹)</th>
              <th style={{ width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              const result = totals.itemResults[validItems.findIndex((vi) =>
                vi.product_name === item.product_name && vi.quantity === item.quantity && vi.rate === item.rate
              )];
              const lineAmount = result?.amount ?? 0;
              const lineDiscount = result?.discount_amount ?? 0;

              return (
                <tr key={item._key}>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{index + 1}</td>
                  <td>
                    <input
                      ref={index === items.length - 1 ? itemRef : undefined}
                      type="text"
                      className="form-input"
                      placeholder="Product description..."
                      value={item.product_name}
                      onChange={(e) => updateItem(item._key, 'product_name', e.target.value)}
                      style={{ width: '100%', padding: '2px 6px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addItem();
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input amount-input"
                      value={item.quantity || ''}
                      onChange={(e) => updateItem(item._key, 'quantity', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '2px 6px' }}
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input amount-input"
                      value={item.rate || ''}
                      onChange={(e) => updateItem(item._key, 'rate', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '2px 6px' }}
                      min="0"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input amount-input"
                      value={item.discount_percent || ''}
                      onChange={(e) => updateItem(item._key, 'discount_percent', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '2px 6px' }}
                      min="0"
                      max="100"
                    />
                  </td>
                  <td className="num amount">{lineDiscount > 0 ? formatCurrency(lineDiscount) : '—'}</td>
                  <td className="num amount">{lineAmount > 0 ? formatCurrency(lineAmount) : '—'}</td>
                  <td>
                    {items.length > 1 && (
                      <button className="btn btn-danger" style={{ padding: '2px 4px' }} onClick={() => removeItem(item._key)}>
                        <X size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <button className="btn" onClick={addItem}>
            <Plus size={12} /> Add Item
          </button>
        </div>
      </div>

      <div style={{ padding: '4px 16px', borderTop: '1px solid var(--border-subtle)' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Narration..."
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          style={{ width: '100%', fontSize: 'var(--text-xs)', padding: '3px 6px' }}
        />
      </div>

      <div className="voucher-totals">
        <div className="voucher-total-row">
          <span>Subtotal</span>
          <span className="amount">{formatCurrency(totals.subtotal)}</span>
        </div>
        <div className="voucher-total-row grand">
          <span>TOTAL PURCHASE</span>
          <span>{formatCurrency(totals.grandTotal)}</span>
        </div>
      </div>

      <div className="voucher-actions">
        <button className="btn btn-accent" onClick={handleSave}>
          <Save size={14} /> Save Purchase <span className="shortcut">Ctrl+S</span>
        </button>
        <button className="btn" onClick={() => window.print()}>
          <Printer size={14} /> Print
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={() => navigate('/')}>
          Cancel <span className="shortcut">Esc</span>
        </button>
      </div>
    </div>
  );
}
