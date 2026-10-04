import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { calculateBillTotals } from '@agre/shared/calculations/billing';
import { formatCurrency } from '@agre/shared/utils/currency';
import { formatDateLong } from '@agre/shared/utils/date';
import type { VoucherItemInput } from '@agre/shared/types';
import Autocomplete, { type AutocompleteOption } from '../../components/Autocomplete';
import { useMasters } from '../../stores/mastersStore';
import { useOrderStore } from '../../stores/orderStore';

interface CartItem extends VoucherItemInput {
  _key: string;
  unit: string;
}

export default function OrderEntryPage() {
  const navigate = useNavigate();
  const { customers, products } = useMasters();
  const addOrder = useOrderStore((s) => s.addOrder);

  const [partyName, setPartyName] = useState('');
  const [partyBalance, setPartyBalance] = useState('0.00');
  const [priceLevel, setPriceLevel] = useState<'selling_price' | 'wholesale_price' | 'special_price' | 'cost_price'>('selling_price');
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

  const updateItem = useCallback((key: string, field: keyof CartItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => (item._key === key ? { ...item, [field]: value } : item))
    );
  }, []);

  // When price level changes, automatically update the rate for already selected products
  React.useEffect(() => {
    setItems((prev) =>
      prev.map((item) => {
        if (!item.product_name) return item;
        const p = products.find((prod) => prod.name === item.product_name);
        if (p) {
          return { ...item, rate: p[priceLevel] || p.selling_price || 0 };
        }
        return item;
      })
    );
  }, [priceLevel, products]);

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
              rate: p ? p[priceLevel] || p.selling_price || 0 : item.rate,
              unit: p?.unit_symbol || item.unit,
            }
          : item
      )
    );
  }, [priceLevel]);

  const validItems = items.filter((i) => i.product_name && i.quantity > 0 && i.rate > 0);
  const totals = calculateBillTotals(validItems, 0);

  const handleSave = useCallback(() => {
    if (validItems.length === 0 || !partyName.trim()) {
      alert("Please enter a customer name and at least one item.");
      return;
    }
    
    addOrder({
      customerName: partyName,
      items: validItems,
      priceLevel,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      // Reset form
      setPartyName('');
      setPartyBalance('0.00');
      setItems([{ _key: Date.now().toString(), product_name: '', quantity: 1, rate: 0, unit: 'pcs', discount_percent: 0, discount_amount: 0 }]);
    }, 1000);
  }, [validItems, partyName, priceLevel, addOrder]);

  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: handleSave, description: 'Send to Queue' },
    { key: 'Escape', action: () => navigate('/'), description: 'Back' },
  ]);

  return (
    <div className="tp-voucher-frame">
      <div className="tp-voucher-top-info" style={{ padding: '0 8px', background: '#fff3e0', borderBottom: '1px solid #ffcc80' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontWeight: 'bold', fontSize: 13, color: '#e65100', textTransform: 'uppercase' }}>Sales Order Entry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span style={{ color: '#15803d', fontWeight: 'bold' }}>✓ Order Added to Queue</span>}
          <span style={{ fontWeight: 600, fontSize: 12 }}>{formatDateLong(new Date().toISOString())}</span>
        </div>
      </div>

      <div className="tp-voucher-party-row" style={{ marginTop: 8, padding: '0 8px' }}>
        <span className="tp-party-label">Party A/c name</span>
        <span className="tp-colon">:</span>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <Autocomplete
            className="tp-party-input"
            style={{ width: '100%', borderColor: !partyName ? '#ef4444' : undefined }}
            value={partyName}
            onChange={setPartyName}
            onSelect={selectCustomer}
            options={customerOptions}
            placeholder="Select or enter customer name (Required)"
          />
        </div>
        <span className="tp-party-balance">Current balance : {partyBalance}</span>
      </div>

      <div className="tp-voucher-party-row" style={{ padding: '0 8px' }}>
        <span className="tp-party-label">Price Level</span>
        <span className="tp-colon">:</span>
        <select
          className="tp-party-input"
          value={priceLevel}
          onChange={(e) => setPriceLevel(e.target.value as any)}
          style={{ maxWidth: 160 }}
        >
          <option value="selling_price">Retail Price</option>
          <option value="wholesale_price">Wholesale Price</option>
          <option value="special_price">Special Price</option>
          <option value="cost_price">Cost Price</option>
        </select>
      </div>

      {/* Items Table */}
      <div className="tp-voucher-grid" style={{ flex: 1, minHeight: 220 }}>
        <div className="tp-grid-header">
          <div style={{ flex: 1, paddingLeft: 8 }}>Name of Item</div>
          <div style={{ width: 90, textAlign: 'right' }}>Quantity</div>
          <div style={{ width: 110, textAlign: 'right' }}>Rate</div>
          <div style={{ width: 60, textAlign: 'center' }}>per</div>
          <div style={{ width: 120, textAlign: 'right', paddingRight: 8 }}>Amount</div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {items.map((item, index) => {
            const lineAmount = item.quantity && item.rate ? item.quantity * item.rate : 0;
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
                <div style={{ width: 120, textAlign: 'right', paddingRight: 8, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {lineAmount > 0 ? lineAmount.toFixed(2) : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tp-voucher-bottom">
        <div className="tp-narration-box" style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <button
            className="tp-btn primary"
            onClick={handleSave}
            style={{ padding: '12px 24px', background: '#e65100', borderColor: '#e65100' }}
          >
            Send Order to Queue (Ctrl+S)
          </button>
          <button className="tp-btn" onClick={addItem}>
            + Add Line
          </button>
        </div>
        <div className="tp-total-box" style={{ padding: '8px 16px' }}>
          <div className="tp-grand-total">
            <span style={{ fontSize: 13, fontWeight: 700, marginRight: 12 }}>EST TOTAL:</span>
            <span>₹{formatCurrency(totals.subtotal, '')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
