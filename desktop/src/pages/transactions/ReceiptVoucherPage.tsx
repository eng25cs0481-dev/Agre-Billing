import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, Save, ArrowLeft } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { formatCurrency } from '@agre/shared/utils/currency';
import { formatDateLong } from '@agre/shared/utils/date';
import type { PaymentMode } from '@agre/shared/types';
import Autocomplete, { type AutocompleteOption } from '../../components/Autocomplete';
import { useMasters } from '../../stores/mastersStore';

export default function ReceiptVoucherPage() {
  const navigate = useNavigate();
  const { customers } = useMasters();
  const [voucherNo, setVoucherNo] = useState('RCP-0001');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [refNumber, setRefNumber] = useState('');
  const [narration, setNarration] = useState('');
  const [saved, setSaved] = useState(false);

  const customerOptions = useMemo<AutocompleteOption[]>(
    () =>
      customers.map((c) => ({
        label: c.name,
        sublabel: c.outstanding_balance
          ? `Due ${formatCurrency(c.outstanding_balance, '')}`
          : c.phone || '',
        value: c.id,
        data: c,
      })),
    [customers]
  );

  const handleSave = () => {
    if (!amount || amount <= 0) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  useKeyboardShortcuts([
    { key: 's', ctrl: true, action: handleSave, description: 'Save' },
    { key: 'a', ctrl: true, action: handleSave, description: 'Accept' },
    { key: 'Escape', action: () => navigate('/'), description: 'Back' },
  ]);

  return (
    <div className="tp-voucher-frame" style={{ maxWidth: 750, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div className="tp-voucher-top-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="tp-voucher-badge" style={{ backgroundColor: '#0284c7' }}>Receipt</span>
          <span style={{ fontWeight: 'bold', fontSize: 13, color: '#0c3c78' }}>No.</span>
          <input
            type="text"
            className="tp-voucher-no-input"
            value={voucherNo}
            onChange={(e) => setVoucherNo(e.target.value)}
            style={{ width: 130 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: 12 }}>✓ Receipt Saved</span>}
          <span style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>{formatDateLong(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Main Voucher Body */}
      <div style={{ background: '#ffffff', border: '1px solid #cadfe8', padding: 20, flex: 1, overflowY: 'auto' }}>
        {/* Account / Deposit To */}
        <div className="tp-voucher-party-row" style={{ marginBottom: 14 }}>
          <span className="tp-party-label" style={{ width: 180 }}>Account (Deposited in)</span>
          <span className="tp-colon">:</span>
          <select
            className="tp-party-input"
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
            style={{ fontWeight: 'bold', width: 220 }}
          >
            <option value="cash">Cash in Hand</option>
            <option value="bank_transfer">Bank Current Account</option>
            <option value="upi">UPI / QR Code</option>
            <option value="credit">Other Account</option>
          </select>
        </div>

        {/* Particulars / Received From */}
        <div className="tp-voucher-party-row" style={{ marginBottom: 14 }}>
          <span className="tp-party-label" style={{ width: 180 }}>Particulars (Received from)</span>
          <span className="tp-colon">:</span>
          <div style={{ flex: 1 }}>
            <Autocomplete
              className="tp-party-input"
              style={{ width: '100%', fontWeight: 'bold' }}
              placeholder="Select Customer or Sundry Debtor..."
              value={customerName}
              onChange={setCustomerName}
              onSelect={(opt) => setCustomerName(opt.label)}
              options={customerOptions}
            />
          </div>
        </div>

        {/* Amount */}
        <div className="tp-voucher-party-row" style={{ marginBottom: 14 }}>
          <span className="tp-party-label" style={{ width: 180 }}>Amount (₹)</span>
          <span className="tp-colon">:</span>
          <input
            type="number"
            className="tp-party-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || '')}
            style={{ width: 200, fontSize: 14, fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}
            min="0"
          />
        </div>

        {/* Cheque / Reference */}
        <div className="tp-voucher-party-row" style={{ marginBottom: 14 }}>
          <span className="tp-party-label" style={{ width: 180 }}>Cheque / Ref No.</span>
          <span className="tp-colon">:</span>
          <input
            type="text"
            className="tp-party-input"
            placeholder="Cheque No / UTR / Reference"
            value={refNumber}
            onChange={(e) => setRefNumber(e.target.value)}
            style={{ width: 250 }}
          />
        </div>

        {/* Narration */}
        <div className="tp-voucher-party-row" style={{ marginBottom: 14 }}>
          <span className="tp-party-label" style={{ width: 180 }}>Narration</span>
          <span className="tp-colon">:</span>
          <input
            type="text"
            className="tp-party-input"
            placeholder="Enter receipt notes or settlement details..."
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {/* Summary and Bottom Bar */}
      <div className="tp-totals-section" style={{ borderTop: '2px solid #0c3c78' }}>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>Shortcut: Press ^A or Ctrl+S to save</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78' }}>TOTAL RECEIVED:</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#0c3c78', fontFamily: 'var(--font-mono)' }}>
            {formatCurrency(Number(amount) || 0)}
          </span>
        </div>
      </div>

      <div className="tp-bottom-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="tp-btn primary" onClick={handleSave} disabled={!amount || amount <= 0}>
            Save Receipt (^A / Ctrl+S)
          </button>
          <button className="tp-btn" onClick={() => window.print()}>
            <Printer size={12} style={{ marginRight: 4 }} /> Print Receipt
          </button>
        </div>
        <div>
          <button className="tp-btn danger" onClick={() => navigate('/')}>
            Cancel (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}
