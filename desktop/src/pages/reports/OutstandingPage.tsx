import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { CustomerWithBalance, SupplierWithBalance } from '@agre/shared/types';
import { api } from '../../services/api';
import { useAppStore } from '../../stores/appStore';

export default function OutstandingPage() {
  const company = useAppStore(s => s.company);
  const [tab, setTab] = useState<'receivables' | 'payables'>('receivables');
  const [receivables, setReceivables] = useState<CustomerWithBalance[]>([]);
  const [payables, setPayables] = useState<SupplierWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    Promise.all([api.getCustomers(company.id), api.getSuppliers(company.id)]).then(([c, s]) => {
      setReceivables(c.filter((item) => item.outstanding_balance > 0));
      setPayables(s.filter((item) => item.outstanding_balance > 0));
      setLoading(false);
    });
  }, [company]);

  const totalReceivable = receivables.reduce((s, r) => s + (r.outstanding_balance || 0), 0);
  const totalPayable = payables.reduce((s, p) => s + (p.outstanding_balance || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Outstanding Balances</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`tp-btn ${tab === 'receivables' ? 'primary' : ''}`}
            onClick={() => setTab('receivables')}
          >
            Receivables (Customers)
          </button>
          <button
            className={`tp-btn ${tab === 'payables' ? 'primary' : ''}`}
            onClick={() => setTab('payables')}
          >
            Payables (Suppliers)
          </button>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-card-label">Total Customer Receivables</div>
          <div className="summary-card-value negative">{formatCurrency(totalReceivable)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Total Supplier Payables</div>
          <div className="summary-card-value positive">{formatCurrency(totalPayable)}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {tab === 'receivables' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone</th>
                <th className="num">Total Billed (₹)</th>
                <th className="num">Total Received (₹)</th>
                <th className="num">Outstanding Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {receivables.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    {loading ? 'Loading receivables...' : 'No customer receivables pending.'}
                  </td>
                </tr>
              ) : (
                receivables.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.phone || '—'}</td>
                    <td className="num amount">{formatCurrency(c.total_receivable || 0)}</td>
                    <td className="num amount">{formatCurrency(c.total_received || 0)}</td>
                    <td className="num amount debit">{formatCurrency(c.outstanding_balance || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right' }}>Total Receivables</td>
                <td className="num amount debit">{formatCurrency(totalReceivable)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier Name</th>
                <th>Phone</th>
                <th className="num">Total Purchases (₹)</th>
                <th className="num">Total Paid (₹)</th>
                <th className="num">Outstanding Payable (₹)</th>
              </tr>
            </thead>
            <tbody>
              {payables.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    {loading ? 'Loading payables...' : 'No supplier payables pending.'}
                  </td>
                </tr>
              ) : (
                payables.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.phone || '—'}</td>
                    <td className="num amount">{formatCurrency(s.total_payable || 0)}</td>
                    <td className="num amount">{formatCurrency(s.total_paid || 0)}</td>
                    <td className="num amount credit">{formatCurrency(s.outstanding_balance || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right' }}>Total Payables</td>
                <td className="num amount credit">{formatCurrency(totalPayable)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
