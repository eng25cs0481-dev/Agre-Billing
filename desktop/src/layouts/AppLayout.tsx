import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { useGlobalShortcuts } from '../hooks/useKeyboardShortcuts';
import { formatDateLong } from '@agre/shared/utils/date';

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const company = useAppStore((s) => s.company);
  const currentDate = useAppStore((s) => s.currentDate);

  const [searchQuery, setSearchQuery] = useState('');

  useGlobalShortcuts();

  useEffect(() => {
    if (!company) {
      navigate('/select-company');
    }
  }, [company, navigate]);

  // Determine current screen title for the Sky Blue ribbon
  const getScreenTitle = () => {
    const p = location.pathname;
    if (p === '/') return 'Gateway of Agre';
    if (p.includes('/transactions/sale')) return 'Accounting Voucher Creation (Sales)';
    if (p.includes('/transactions/purchase')) return 'Accounting Voucher Creation (Purchase)';
    if (p.includes('/transactions/receipt')) return 'Accounting Voucher Creation (Receipt)';
    if (p.includes('/transactions/payment')) return 'Accounting Voucher Creation (Payment)';
    if (p.includes('/transactions/expense')) return 'Accounting Voucher Creation (Expense)';
    if (p.includes('/reports/daybook')) return 'Day Book';
    if (p.includes('/reports/stock-summary')) return 'Stock Summary';
    if (p.includes('/reports/outstanding')) return 'Outstanding Details';
    if (p.includes('/reports/analytics')) return 'Business Analytics Dashboard';
    if (p.includes('/masters/products')) return 'List of Products / Stock Items';
    if (p.includes('/masters/customers')) return 'List of Sundry Debtors (Customers)';
    if (p.includes('/masters/suppliers')) return 'List of Sundry Creditors (Suppliers)';
    if (p.includes('/masters/ledgers')) return 'List of Ledgers / Chart of Accounts';
    if (p.includes('/settings')) return 'Company Configuration & Settings';
    if (p.includes('/utilities/export')) return 'Export / Import Master Data';
    if (p.includes('/utilities/sync')) return 'Synchronization & Network Status';
    return 'Agre Billing';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      {/* 1. TOP ROYAL BLUE GLOBAL BAR */}
      <header className="tp-topbar">
        <div className="tp-brand-section" onClick={() => navigate('/')}>
          <span className="tp-brand-logo">Agre</span>
          <span className="tp-brand-badge">SILVER</span>
          <span style={{ fontSize: 13, fontWeight: 700, marginLeft: 2 }}>Prime</span>
        </div>

        <div className="tp-top-nav">
          <div className="tp-top-btn" onClick={() => navigate('/select-company')}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>K</span>: Company
          </div>
          <div className="tp-top-btn" onClick={() => navigate('/utilities/sync')}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Y</span>: Data
          </div>
          <div className="tp-top-btn" onClick={() => navigate('/utilities/sync')}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>Z</span>: Exchange
          </div>
        </div>

        {/* Global Search / Go To */}
        <div className="tp-search-container">
          <input
            type="text"
            className="tp-search-input"
            placeholder="Find details entered in masters and transactions. (Alt+G)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="tp-top-nav">
          <div className="tp-top-btn goto" onClick={() => navigate('/')}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>G</span>: Go To
          </div>
          <div className="tp-top-btn" onClick={() => navigate('/utilities/import')}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>O</span>: Import
          </div>
          <div className="tp-top-btn" onClick={() => navigate('/utilities/export')}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>E</span>: Export
          </div>
          <div className="tp-top-btn" onClick={() => window.print()}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>P</span>: Print
          </div>
          <div className="tp-top-btn" onClick={() => alert('Agre Billing Help & Shortcuts: F5=Payment, F6=Receipt, F8=Sales, F9=Purchase, Ctrl+S=Save, Esc=Quit')}>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>F1</span>: Help
          </div>
        </div>
      </header>

      {/* 2. SUBHEADER SKY BLUE RIBBON */}
      <div className="tp-subribbon">
        <div className="tp-subribbon-title">
          <span>{getScreenTitle()}</span>
        </div>
        <div className="tp-subribbon-company">
          {company?.name || 'Agre Machinery And Hardware Stores'}
        </div>
        <div className="tp-subribbon-date">
          {formatDateLong(currentDate)}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE WITH RIGHT F-KEY ACTION SIDEBAR */}
      <div className="tp-main-container">
        {/* Work / Form Area */}
        <div className="tp-work-area">
          <Outlet />
        </div>

        {/* Right F-Key Panel */}
        <aside className="tp-fbar">
          <div className="tp-fbar-btn" onClick={() => {
            const newDate = prompt('Enter Date (YYYY-MM-DD):', currentDate);
            if (newDate) useAppStore.getState().setCurrentDate(newDate);
          }}>
            <span>F2: Date</span>
          </div>
          <div className="tp-fbar-btn" onClick={() => navigate('/select-company')}>
            <span>F3: Company</span>
          </div>
          <div className="tp-fbar-divider" />
          <div className={`tp-fbar-btn ${location.pathname.includes('/payment') ? 'active' : ''}`} onClick={() => navigate('/transactions/payment')}>
            <span>F5: Payment</span>
          </div>
          <div className={`tp-fbar-btn ${location.pathname.includes('/receipt') ? 'active' : ''}`} onClick={() => navigate('/transactions/receipt')}>
            <span>F6: Receipt</span>
          </div>
          <div className={`tp-fbar-btn ${location.pathname.includes('/expense') ? 'active' : ''}`} onClick={() => navigate('/transactions/expense')}>
            <span>F7: Journal / Exp</span>
          </div>
          <div className={`tp-fbar-btn ${location.pathname.includes('/sale') ? 'active' : ''}`} onClick={() => navigate('/transactions/sale')}>
            <span>F8: Sales</span>
          </div>
          <div className={`tp-fbar-btn ${location.pathname.includes('/purchase') ? 'active' : ''}`} onClick={() => navigate('/transactions/purchase')}>
            <span>F9: Purchase</span>
          </div>
          <div className="tp-fbar-divider" />
          <div className={`tp-fbar-btn ${location.pathname.includes('/daybook') ? 'active' : ''}`} onClick={() => navigate('/reports/daybook')}>
            <span>Day Book</span>
          </div>
          <div className={`tp-fbar-btn ${location.pathname.includes('/stock-summary') ? 'active' : ''}`} onClick={() => navigate('/reports/stock-summary')}>
            <span>Stock Summary</span>
          </div>
          <div className={`tp-fbar-btn ${location.pathname.includes('/outstanding') ? 'active' : ''}`} onClick={() => navigate('/reports/outstanding')}>
            <span>Outstanding</span>
          </div>
          <div className={`tp-fbar-btn ${location.pathname.includes('/analytics') ? 'active' : ''}`} onClick={() => navigate('/reports/analytics')}>
            <span>📈 Analytics</span>
          </div>
          <div className="tp-fbar-divider" />
          <div className="tp-fbar-btn" onClick={() => window.print()}>
            <span>P: Print Invoice</span>
          </div>
          <div className="tp-fbar-btn" onClick={() => navigate('/settings')}>
            <span>F12: Configure</span>
          </div>
        </aside>
      </div>

      {/* 4. BOTTOM FUNCTION BAR */}
      <footer className="tp-bottombar">
        <button className="tp-bottom-btn" onClick={() => navigate(-1)}>
          <kbd>Q</kbd>: Quit
        </button>
        <button className="tp-bottom-btn" onClick={() => navigate('/')}>
          <kbd>Esc</kbd>: Gateway
        </button>
        <button className="tp-bottom-btn" onClick={() => {
          const saveBtn = document.querySelector('button[data-save="true"]') as HTMLButtonElement;
          saveBtn?.click();
        }}>
          <kbd>Ctrl+A</kbd>: Accept (Save)
        </button>
        <button className="tp-bottom-btn" onClick={() => window.print()}>
          <kbd>Ctrl+P</kbd>: Print
        </button>
        <button className="tp-bottom-btn" onClick={() => navigate('/masters/products')}>
          <kbd>F8</kbd>: Sales
        </button>
        <button className="tp-bottom-btn" onClick={() => navigate('/reports/daybook')}>
          <kbd>D</kbd>: Day Book
        </button>
        <div style={{ flex: 1 }} />
        <button className="tp-bottom-btn" onClick={() => navigate('/settings')}>
          <kbd>F12</kbd>: Configure
        </button>
      </footer>
    </div>
  );
}
