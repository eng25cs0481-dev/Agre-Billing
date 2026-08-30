import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { formatDateDMY } from '@agre/shared/utils/date';
import type { DayBookEntry } from '@agre/shared/types';
import { api } from '../../services/api';
import { useAppStore } from '../../stores/appStore';

export default function DayBookPage() {
  const navigate = useNavigate();
  const company = useAppStore(s => s.company);
  const [entries, setEntries] = useState<DayBookEntry[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!company) return;
    api.getDayBook(company.id, dateFilter, dateFilter).then((data) => {
      setEntries(data);
    });
  }, [dateFilter, company]);

  const totalDebit = entries.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = entries.reduce((sum, r) => sum + r.credit, 0);

  useKeyboardShortcuts([
    { key: 'ArrowDown', action: () => setSelectedIndex((i) => Math.min(i + 1, Math.max(0, entries.length - 1))), description: 'Down' },
    { key: 'ArrowUp', action: () => setSelectedIndex((i) => Math.max(i - 1, 0)), description: 'Up' },
    {
      key: 'Enter',
      action: () => {
        const item = entries[selectedIndex];
        if (item) navigate(`/transactions/${item.voucher_type}`);
      },
      description: 'Open Voucher',
    },
    { key: 'Escape', action: () => navigate('/'), description: 'Back' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#0c3c78' }}>
          Day Book ({dateFilter})
        </span>
        <span style={{ fontSize: 11, color: '#4b5563' }}>
          Total Vouchers: {entries.length}
        </span>
      </div>

      {/* Main Table */}
      <div className="tp-table-wrap" style={{ flex: 1 }}>
        <table className="tp-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>Date</th>
              <th style={{ width: '38%' }}>Particulars</th>
              <th style={{ width: '12%' }}>Vch Type</th>
              <th style={{ width: '14%' }}>Vch No.</th>
              <th style={{ width: '12%' }} className="num">Debit Amount</th>
              <th style={{ width: '12%' }} className="num">Credit Amount</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  No vouchers recorded for this date. Press F8 to create a new Sale.
                </td>
              </tr>
            ) : (
              entries.map((row, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <tr
                    key={row.voucher_id}
                    className={isSelected ? 'selected' : ''}
                    onClick={() => setSelectedIndex(idx)}
                    onDoubleClick={() => navigate(`/transactions/${row.voucher_type}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatDateDMY(row.date)}</td>
                    <td style={{ fontWeight: isSelected ? 800 : 600 }}>{row.particular}</td>
                    <td>{row.voucher_type.toUpperCase()}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{row.voucher_number}</td>
                    <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.debit > 0 ? row.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}
                    </td>
                    <td className="num" style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.credit > 0 ? row.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : ''}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr style={{ background: '#e1eff8', fontWeight: 'bold', borderTop: '2px solid #0c3c78' }}>
              <td colSpan={4} style={{ textAlign: 'right', padding: '6px' }}>Total</td>
              <td className="num" style={{ fontFamily: 'var(--font-mono)', color: '#0c3c78' }}>
                {totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
              <td className="num" style={{ fontFamily: 'var(--font-mono)', color: '#0c3c78' }}>
                {totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, color: '#4b5563' }}>
        <span>Press Enter on any transaction to open voucher</span>
        <span>Use Arrow keys ↑ ↓ to navigate</span>
      </div>
    </div>
  );
}
