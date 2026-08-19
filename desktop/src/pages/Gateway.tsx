import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface MenuItem {
  label: string;
  hotkey: string;
  path: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

const GATEWAY_MENU: MenuCategory[] = [
  {
    title: 'Masters',
    items: [
      { label: 'Products / Items', hotkey: 'P', path: '/masters/products' },
      { label: 'Customers (Debtors)', hotkey: 'C', path: '/masters/customers' },
      { label: 'Suppliers (Creditors)', hotkey: 'S', path: '/masters/suppliers' },
      { label: 'Ledgers & Accounts', hotkey: 'L', path: '/masters/ledgers' },
    ],
  },
  {
    title: 'Transactions',
    items: [
      { label: 'Sales Voucher', hotkey: 'F8', path: '/transactions/sale' },
      { label: 'Purchase Voucher', hotkey: 'F9', path: '/transactions/purchase' },
      { label: 'Receipt Voucher', hotkey: 'R', path: '/transactions/receipt' },
      { label: 'Payment Voucher', hotkey: 'Y', path: '/transactions/payment' },
      { label: 'Expense Voucher', hotkey: 'E', path: '/transactions/expense' },
    ],
  },
  {
    title: 'Reports & Registers',
    items: [
      { label: 'Day Book', hotkey: 'D', path: '/reports/daybook' },
      { label: 'Stock Summary', hotkey: 'T', path: '/reports/stock-summary' },
      { label: 'Outstanding Dues', hotkey: 'O', path: '/reports/outstanding' },
    ],
  },
  {
    title: 'Utilities & Settings',
    items: [
      { label: 'Company Settings', hotkey: 'K', path: '/settings' },
      { label: 'Data Export / Import', hotkey: 'X', path: '/utilities/export' },
      { label: 'Sync & Network', hotkey: 'N', path: '/utilities/sync' },
    ],
  },
];

export default function Gateway() {
  const navigate = useNavigate();
  const allItems = GATEWAY_MENU.flatMap((c) => c.items);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useKeyboardShortcuts([
    { key: 'ArrowDown', action: () => setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1)), description: 'Down' },
    { key: 'ArrowUp', action: () => setSelectedIndex((i) => Math.max(i - 1, 0)), description: 'Up' },
    { key: 'Enter', action: () => navigate(allItems[selectedIndex].path), description: 'Select' },
    // Letter hotkeys
    { key: 'p', action: () => navigate('/masters/products'), description: 'Products' },
    { key: 'c', action: () => navigate('/masters/customers'), description: 'Customers' },
    { key: 's', action: () => navigate('/masters/suppliers'), description: 'Suppliers' },
    { key: 'l', action: () => navigate('/masters/ledgers'), description: 'Ledgers' },
    { key: 'r', action: () => navigate('/transactions/receipt'), description: 'Receipt' },
    { key: 'y', action: () => navigate('/transactions/payment'), description: 'Payment' },
    { key: 'd', action: () => navigate('/reports/daybook'), description: 'Day Book' },
    { key: 't', action: () => navigate('/reports/stock-summary'), description: 'Stock' },
    { key: 'o', action: () => navigate('/reports/outstanding'), description: 'Outstanding' },
  ]);

  let globalIdx = -1;

  return (
    <div className="tp-gateway-container">
      <div className="tp-gateway-box">
        <div className="tp-gateway-header">
          Gateway of Agre Prime
        </div>

        {GATEWAY_MENU.map((category) => (
          <div key={category.title}>
            <div className="tp-gateway-section-title">{category.title}</div>
            {category.items.map((item) => {
              globalIdx++;
              const isSelected = globalIdx === selectedIndex;
              const idx = globalIdx;

              return (
                <div
                  key={item.path}
                  className={`tp-gateway-menu-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <span>
                    <span className="tp-gateway-hotkey">{item.hotkey}</span>: {item.label}
                  </span>
                  <span style={{ fontSize: '10.5px', color: isSelected ? '#000' : '#64748b' }}>↵</span>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ padding: '6px 24px', borderTop: '1px solid #cadfe8', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px' }}>
          <span>Use ↑ ↓ arrow keys and Enter</span>
          <span>Esc to Quit</span>
        </div>
      </div>
    </div>
  );
}
