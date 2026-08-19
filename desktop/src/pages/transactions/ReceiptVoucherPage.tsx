import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Printer } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { PaymentMode } from '@agre/shared/types';
import { PAYMENT_MODE_LABELS } from '@agre/shared/constants';

export default function ReceiptVoucherPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [refNumber, setRefNumber] = useState('');
  const [narration, setNarration] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!amount || amount <= 0) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: handleSave, description: 'Save' },
    { key: 'Escape', action: () => navigate('/'), description: 'Back' },
  ]);

  return (
    <div className="voucher-form" style={{ maxWidth: 700, margin: '0 auto', height: 'auto' }}>
      <div className="voucher-header">
        <span className="voucher-title">Receipt Voucher (Customer Payment)</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-xs)' }}>✓ Saved</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>F6</span>
        </div>
      </div>

      <div style={{ padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Received In</label>
            <select className="form-select" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}>
              {Object.entries(PAYMENT_MODE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Received From (Customer / Account)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Select customer or ledger..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Amount Received (₹)</label>
          <input
            type="number"
            className="form-input amount-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
            style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Cheque / UPI / Transaction Reference</label>
          <input
            type="text"
            className="form-input"
            placeholder="Ref No. (optional)"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Narration / Notes</label>
          <input
            type="text"
            className="form-input"
            placeholder="Payment details or invoice reference..."
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
          />
        </div>
      </div>

      <div className="voucher-totals" style={{ alignItems: 'flex-start', padding: 'var(--space-4) var(--space-8)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-credit)' }}>
          <span>Total Received:</span>
          <span>{formatCurrency(Number(amount) || 0)}</span>
        </div>
      </div>

      <div className="voucher-actions">
        <button className="btn btn-accent" onClick={handleSave}>
          <Save size={14} /> Record Receipt <span className="shortcut">Ctrl+S</span>
        </button>
        <button className="btn" onClick={() => window.print()}>
          <Printer size={14} /> Print Receipt
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn" onClick={() => navigate('/')}>
          Cancel <span className="shortcut">Esc</span>
        </button>
      </div>
    </div>
  );
}
