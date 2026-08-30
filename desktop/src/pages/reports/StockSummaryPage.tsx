import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { StockSummary } from '@agre/shared/types';
import { api } from '../../services/api';
import { useAppStore } from '../../stores/appStore';

export default function StockSummaryPage() {
  const company = useAppStore(s => s.company);
  const [stock, setStock] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    api.getStockSummary(company.id).then((data) => {
      setStock(data);
      setLoading(false);
    });
  }, [company]);

  const totalValue = stock.reduce((sum, s) => sum + s.stock_value, 0);
  const lowStockCount = stock.filter((s) => s.is_below_minimum).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Stock Summary</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {lowStockCount > 0 && (
            <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
              ⚠ {lowStockCount} Item(s) Below Minimum Stock
            </span>
          )}
          <button className="tp-btn" onClick={() => window.print()}>Print Summary</button>
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-card">
          <div className="summary-card-label">Total Stock Value (Cost)</div>
          <div className="summary-card-value">{formatCurrency(totalValue)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Total Unique Products</div>
          <div className="summary-card-value">{stock.length}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-label">Low Stock Alerts</div>
          <div className="summary-card-value" style={{ color: lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {lowStockCount}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '30%' }}>Product Name</th>
              <th style={{ width: '12%' }}>SKU</th>
              <th style={{ width: '12%' }}>Category</th>
              <th style={{ width: '12%' }} className="num">Quantity</th>
              <th style={{ width: '12%' }} className="num">Cost Rate</th>
              <th style={{ width: '12%' }} className="num">Selling Rate</th>
              <th style={{ width: '14%' }} className="num">Stock Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  {loading ? 'Loading stock...' : 'No inventory items found. Add products in Masters > Products.'}
                </td>
              </tr>
            ) : (
              stock.map((item) => (
                <tr key={item.product_id}>
                  <td>
                    {item.product_name}
                    {item.is_below_minimum && (
                      <span style={{ marginLeft: 8, color: 'var(--color-error)', fontSize: '10px', fontWeight: 'bold' }}>[LOW]</span>
                    )}
                  </td>
                  <td>{item.product_sku || '—'}</td>
                  <td>{item.category_name || '—'}</td>
                  <td className="num">
                    <span style={{ color: item.is_below_minimum ? 'var(--color-error)' : undefined, fontWeight: 600 }}>
                      {item.current_stock} {item.unit_name}
                    </span>
                  </td>
                  <td className="num amount">{formatCurrency(item.cost_price)}</td>
                  <td className="num amount">{formatCurrency(item.selling_price)}</td>
                  <td className="num amount" style={{ color: 'var(--color-total)' }}>{formatCurrency(item.stock_value)}</td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={6} style={{ textAlign: 'right' }}>Total Inventory Valuation</td>
              <td className="num amount">{formatCurrency(totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
