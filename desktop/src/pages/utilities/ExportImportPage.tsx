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
    <div className="tp-voucher-frame">
      <div className="tp-voucher-top-info" style={{ alignItems: 'center', padding: '8px 16px', background: '#e1eff8' }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#0c3c78' }}>
          Data Export / Import Utility
        </div>
      </div>

      <div style={{ padding: '16px', display: 'flex', gap: '20px' }}>
        
        {/* Export Card */}
        <div style={{ flex: 1, background: '#ffffff', border: '1px solid #94bde0', padding: '16px' }}>
          <h2 style={{ fontSize: 14, color: '#0c3c78', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Download size={18} /> Export Data
          </h2>
          <p style={{ fontSize: 11, color: '#4b5563', marginBottom: '16px' }}>
            Export data to CSV / Excel spreadsheet for backup or spreadsheet analysis.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Data to Export</label>
            <select 
              className="tp-party-input" 
              style={{ width: '100%', padding: '6px' }}
              value={exportType} 
              onChange={(e) => setExportType(e.target.value)}
            >
              <option value="sales">Sales Register</option>
              <option value="purchases">Purchase Register</option>
              <option value="products">Product Catalog & Stock</option>
              <option value="customers">Customers & Balances</option>
              <option value="suppliers">Suppliers & Balances</option>
              <option value="daybook">Complete Day Book</option>
            </select>
          </div>

          <button className="tp-btn tp-btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '8px' }} onClick={handleExport}>
            <Download size={14} /> Download Excel / CSV
          </button>

          {exported && (
            <div style={{ marginTop: '12px', color: '#059669', fontSize: 11, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={14} /> Export completed successfully.
            </div>
          )}
        </div>

        {/* Import Card */}
        <div style={{ flex: 1, background: '#ffffff', border: '1px solid #94bde0', padding: '16px' }}>
          <h2 style={{ fontSize: 14, color: '#0c3c78', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={18} /> Import Master Data
          </h2>
          <p style={{ fontSize: 11, color: '#4b5563', marginBottom: '16px' }}>
            Bulk import Products, Customers, or Suppliers from CSV/Excel templates.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Target Master</label>
            <select className="tp-party-input" style={{ width: '100%', padding: '6px' }}>
              <option value="products">Products Master</option>
              <option value="customers">Customers Master</option>
              <option value="suppliers">Suppliers Master</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}>Select File (.csv, .xlsx)</label>
            <input type="file" className="tp-party-input" style={{ width: '100%', padding: '4px' }} accept=".csv, .xlsx, .xls" />
          </div>

          <button className="tp-btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, padding: '8px', background: '#0c3c78', color: '#fff' }} onClick={() => alert('Validating and importing file data...')}>
            <Upload size={14} /> Validate & Import
          </button>
        </div>
      </div>
    </div>
  );
}
