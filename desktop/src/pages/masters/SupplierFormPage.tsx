import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function SupplierFormPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [paymentTerms, setPaymentTerms] = useState<number | ''>(30);
  const [openingBalance, setOpeningBalance] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter Supplier Name');
      return;
    }

    setSaving(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('suppliers').insert([
          {
            name: name.trim(),
            code: code.trim() || undefined,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
            city: city.trim() || undefined,
            state: state.trim() || undefined,
            payment_terms: Number(paymentTerms) || 30,
            opening_balance: Number(openingBalance) || 0,
            is_active: true,
          },
        ]);

        if (error) {
          alert('Database Error: ' + error.message);
          setSaving(false);
          return;
        }
      }

      setSavedMessage(true);
      setTimeout(() => {
        navigate('/masters/suppliers');
      }, 700);
    } catch (err: any) {
      alert('Error saving supplier: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  useKeyboardShortcuts([
    { key: 'a', ctrl: true, action: handleSave, description: 'Accept' },
    { key: 's', ctrl: true, action: handleSave, description: 'Save' },
    { key: 'Escape', action: () => navigate('/masters/suppliers'), description: 'Quit' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#0c3c78' }}>
          Ledger Creation (Supplier - Sundry Creditors)
        </span>
        {savedMessage && (
          <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: 12 }}>
            ✓ Supplier Created Successfully
          </span>
        )}
      </div>

      <div className="tp-table-wrap" style={{ flex: 1, padding: 16, background: '#edf7ee' }}>
        <div style={{ maxWidth: 650, margin: '0 auto', background: '#ffffff', border: '2px solid #0c3c78', padding: 20, boxShadow: '0 4px 12px rgba(12,60,120,0.1)' }}>
          <div style={{ background: '#0c3c78', color: '#fff', padding: '6px 12px', fontWeight: 'bold', margin: '-20px -20px 20px -20px', fontSize: 13 }}>
            Party / Supplier Master (Sundry Creditor)
          </div>

          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 140, fontWeight: 700, color: '#1f2937' }}>Name</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input
              type="text"
              className="tp-party-input"
              style={{ flex: 1, fontWeight: 700 }}
              placeholder="e.g. Vishnu Traders Wholesale"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 140, color: '#4b5563' }}>(alias / Code)</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input
              type="text"
              className="tp-party-input"
              style={{ flex: 1 }}
              placeholder="e.g. S001"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div style={{ borderTop: '1px solid #cadfe8', paddingTop: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, color: '#0c3c78', fontSize: 11.5, marginBottom: 10, textTransform: 'uppercase' }}>
              Group & Payment Terms
            </div>

            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 140, fontWeight: 600 }}>Under Group</span>
              <span style={{ marginRight: 8 }}>:</span>
              <input
                type="text"
                className="tp-party-input"
                style={{ flex: 1, background: '#f1f5f9' }}
                value="Sundry Creditors (Current Liabilities)"
                disabled
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 130, fontWeight: 600 }}>Credit Period (Days)</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="number"
                  className="tp-party-input"
                  style={{ width: 90, textAlign: 'right' }}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(parseInt(e.target.value) || '')}
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 120, fontWeight: 600 }}>Opening Due (₹)</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="number"
                  className="tp-party-input"
                  style={{ width: 110, textAlign: 'right' }}
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || '')}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #cadfe8', paddingTop: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, color: '#0c3c78', fontSize: 11.5, marginBottom: 10, textTransform: 'uppercase' }}>
              Contact Details
            </div>

            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 140 }}>Address</span>
              <span style={{ marginRight: 8 }}>:</span>
              <input
                type="text"
                className="tp-party-input"
                style={{ flex: 1 }}
                placeholder="Market Yard / Warehouse Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 100 }}>City</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="text"
                  className="tp-party-input"
                  style={{ width: 130 }}
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 80 }}>Phone</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="text"
                  className="tp-party-input"
                  style={{ width: 140 }}
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="tp-btn" onClick={() => navigate('/masters/suppliers')}>
              Quit (Esc)
            </button>
            <button className="tp-btn primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Accept (^A)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
