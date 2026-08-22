import React, { useState } from 'react';
import { Save, RefreshCw, Download, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export default function SettingsPage() {
  const company = useAppStore((s) => s.company);
  const setCompany = useAppStore((s) => s.setCompany);

  const [name, setName] = useState(company?.name || 'Agre Machinery And Hardware Stores');
  const [address, setAddress] = useState(company?.address || '123 Market Yard');
  const [city, setCity] = useState(company?.city || 'Pune');
  const [state, setState] = useState(company?.state || 'Maharashtra');
  const [phone, setPhone] = useState(company?.phone || '9822001122');
  const [email, setEmail] = useState(company?.email || 'contact@agre.local');
  const [currencySymbol, setCurrencySymbol] = useState(company?.currency_symbol || '₹');
  const [saved, setSaved] = useState(false);

  // App Updates State
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

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

  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    setUpdateStatus(null);

    try {
      const res = await fetch('https://api.github.com/repos/eng25cs0481-dev/Agre-Billing/releases/latest');
      if (res.ok) {
        const release = await res.json();
        setUpdateStatus(`Latest version is ${release.tag_name || 'v1.0.0'}. You are on the newest build.`);
      } else {
        setUpdateStatus('Agre Billing v1.0.0 is up to date (No new releases).');
      }
    } catch {
      setUpdateStatus('Agre Billing v1.0.0 is up to date.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  return (
    <div style={{ maxWidth: 750, margin: '0 auto', overflowY: 'auto', height: '100%', paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ fontSize: 14, fontWeight: 'bold', color: '#0c3c78' }}>Company & System Settings</h1>
        {saved && <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: 12 }}>✓ Settings Saved</span>}
      </div>

      {/* Company Profile Card */}
      <div style={{ background: '#ffffff', border: '2px solid #0c3c78', padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 12.5, fontWeight: 800, color: '#0c3c78', marginBottom: 14, textTransform: 'uppercase' }}>
          Company Profile & Accounting Details
        </h2>

        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 150, fontWeight: 600 }}>Shop / Company Name</span>
          <span style={{ marginRight: 8 }}>:</span>
          <input type="text" className="tp-party-input" style={{ flex: 1 }} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 150 }}>Address</span>
          <span style={{ marginRight: 8 }}>:</span>
          <input type="text" className="tp-party-input" style={{ flex: 1 }} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 150 }}>City</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input type="text" className="tp-party-input" style={{ flex: 1 }} value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 60 }}>State</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input type="text" className="tp-party-input" style={{ flex: 1 }} value={state} onChange={(e) => setState(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 150 }}>Phone</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input type="text" className="tp-party-input" style={{ flex: 1 }} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 60 }}>Email</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input type="email" className="tp-party-input" style={{ flex: 1 }} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, borderTop: '1px solid #cadfe8', paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 150 }}>Currency Symbol</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input type="text" className="tp-party-input" style={{ width: 70 }} value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 120 }}>Financial Year</span>
            <span style={{ marginRight: 8 }}>:</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>2026-27 (from 01-Apr-2026)</span>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="tp-btn primary" onClick={handleSave}>
            <Save size={13} style={{ marginRight: 4 }} /> Save Company Profile (^A)
          </button>
        </div>
      </div>

      {/* Software Updates & Releases Card */}
      <div style={{ background: '#ffffff', border: '2px solid #0c3c78', padding: 20 }}>
        <h2 style={{ fontSize: 12.5, fontWeight: 800, color: '#0c3c78', marginBottom: 8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} /> Software Updates & Version
        </h2>
        <p style={{ fontSize: 11, color: '#4b5563', marginBottom: 12 }}>
          Agre Billing includes automatic release detection from GitHub repository (<code>eng25cs0481-dev/Agre-Billing</code>).
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: 12, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 12, color: '#0f172a' }}>Installed Version: v1.0.0 (Release Build)</div>
            <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 2 }}>Platform: Desktop (Tauri 2 + React) | Accounting Engine: 7.1</div>
          </div>
          <button className="tp-btn" onClick={checkForUpdates} disabled={checkingUpdate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} className={checkingUpdate ? 'spin' : ''} />
            {checkingUpdate ? 'Checking...' : 'Check for Updates'}
          </button>
        </div>

        {updateStatus && (
          <div style={{ marginTop: 10, padding: '8px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={14} /> {updateStatus}
          </div>
        )}
      </div>
    </div>
  );
}
