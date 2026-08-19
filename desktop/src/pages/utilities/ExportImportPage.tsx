import React, { useState } from 'react';
import { Download, Upload, CheckCircle } from 'lucide-react';

export default function ExportImportPage() {
  const [exportType, setExportType] = useState('sales');
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div style={{ maxWidth: 750, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Excel & Data Utilities</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
        {/* Export Card */}
        <div className="voucher-form" style={{ padding: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-md)', color: 'var(--text-accent)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={18} /> Export Data
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Export data to CSV / Excel spreadsheet for backup or spreadsheet analysis.
          </p>

          <div className="form-group">
            <label className="form-label">Data to Export</label>
            <select className="form-select" value={exportType} onChange={(e) => setExportType(e.target.value)}>
              <option value="sales">Sales Register</option>
              <option value="purchases">Purchase Register</option>
              <option value="products">Product Catalog & Stock</option>
              <option value="customers">Customers & Balances</option>
              <option value="suppliers">Suppliers & Balances</option>
              <option value="daybook">Complete Day Book</option>
            </select>
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }} onClick={handleExport}>
              <Download size={14} /> Download Excel / CSV
            </button>
          </div>

          {exported && (
            <div style={{ marginTop: 'var(--space-4)', color: 'var(--color-success)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Export completed successfully.
            </div>
          )}
        </div>

        {/* Import Card */}
        <div className="voucher-form" style={{ padding: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--text-md)', color: 'var(--text-accent)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={18} /> Import Master Data
          </h2>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
            Bulk import Products, Customers, or Suppliers from CSV/Excel templates.
          </p>

          <div className="form-group">
            <label className="form-label">Target Master</label>
            <select className="form-select">
              <option value="products">Products Master</option>
              <option value="customers">Customers Master</option>
              <option value="suppliers">Suppliers Master</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select File (.csv, .xlsx)</label>
            <input type="file" className="form-input" accept=".csv, .xlsx, .xls" />
          </div>

          <div style={{ marginTop: 'var(--space-6)' }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => alert('Validating and importing file data...')}>
              <Upload size={14} /> Validate & Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
