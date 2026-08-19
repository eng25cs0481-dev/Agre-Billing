import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export default function SettingsPage() {
  const company = useAppStore((s) => s.company);
  const setCompany = useAppStore((s) => s.setCompany);

  const [name, setName] = useState(company?.name || 'Agre General Store');
  const [address, setAddress] = useState(company?.address || '123 Market Yard');
  const [city, setCity] = useState(company?.city || 'Pune');
  const [state, setState] = useState(company?.state || 'Maharashtra');
  const [phone, setPhone] = useState(company?.phone || '9822001122');
  const [email, setEmail] = useState(company?.email || 'contact@agre.local');
  const [currencySymbol, setCurrencySymbol] = useState(company?.currency_symbol || '₹');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setCompany({
      id: company?.id || 'demo-company',
      name,
      address,
      city,
      state,
      phone,
      email,
      currency_code: 'INR',
      currency_symbol: currencySymbol,
      decimal_places: 2,
      books_beginning_date: '2026-04-01',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Company & System Settings</h1>
        {saved && <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>✓ Settings Saved</span>}
      </div>

      <div className="voucher-form" style={{ padding: 'var(--space-8)' }}>
        <h2 style={{ fontSize: 'var(--text-md)', color: 'var(--text-accent)', marginBottom: 'var(--space-4)' }}>Company Profile</h2>

        <div className="form-group">
          <label className="form-label">Shop / Company Name</label>
          <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">City</label>
            <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input type="text" className="form-input" value={state} onChange={(e) => setState(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Currency Symbol</label>
            <input type="text" className="form-input" value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Books Beginning Date</label>
            <input type="date" className="form-input" defaultValue="2026-04-01" />
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-8)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-accent" onClick={handleSave}>
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
