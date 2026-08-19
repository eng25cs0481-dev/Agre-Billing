import React from 'react';
import { formatCurrency } from '@agre/shared/utils/currency';
import { formatDateDMY } from '@agre/shared/utils/date';
import type { VoucherWithItems, Company } from '@agre/shared/types';

interface InvoiceProps {
  voucher: Partial<VoucherWithItems>;
  company: Partial<Company>;
}

export const A4Invoice: React.FC<InvoiceProps> = ({ voucher, company }) => {
  return (
    <div className="invoice-a4" style={{
      background: 'white',
      color: '#111',
      padding: '40px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      lineHeight: 1.5,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a237e', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1a237e', fontWeight: 800 }}>
            {company.name || 'AGRE GENERAL STORE'}
          </h1>
          <div>{company.address || 'Market Yard, Main Road'}</div>
          <div>{company.city || 'Pune'}, {company.state || 'Maharashtra'}</div>
          <div>Phone: {company.phone || '9822001122'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#ff6f00', fontWeight: 700 }}>TAX INVOICE / BILL</h2>
          <div style={{ marginTop: '8px' }}><strong>Bill No:</strong> {voucher.voucher_number || 'SAL/000001'}</div>
          <div><strong>Date:</strong> {voucher.date ? formatDateDMY(voucher.date) : '19/08/2026'}</div>
          <div><strong>Payment:</strong> {voucher.payment_mode?.toUpperCase() || 'CASH'}</div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: '20px', background: '#f8f9fa', padding: '12px', borderRadius: '4px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Bill To / Customer:</div>
        <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>{voucher.party_name || 'Walk-in Customer'}</div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#1a237e', color: 'white', textAlign: 'left' }}>
            <th style={{ padding: '8px', width: '40px' }}>#</th>
            <th style={{ padding: '8px' }}>Product Description</th>
            <th style={{ padding: '8px', textAlign: 'right', width: '80px' }}>Qty</th>
            <th style={{ padding: '8px', textAlign: 'right', width: '100px' }}>Rate (₹)</th>
            <th style={{ padding: '8px', textAlign: 'right', width: '90px' }}>Disc (₹)</th>
            <th style={{ padding: '8px', textAlign: 'right', width: '110px' }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {(voucher.items || [
            { product_name: 'Basmati Rice 5kg', quantity: 5, rate: 120, discount_amount: 0, amount: 600 },
            { product_name: 'Sunflower Oil 1L', quantity: 2, rate: 250, discount_amount: 0, amount: 500 },
          ]).map((item, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '8px' }}>{idx + 1}</td>
              <td style={{ padding: '8px', fontWeight: 600 }}>{item.product_name}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(item.rate, '')}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}>{item.discount_amount ? formatCurrency(item.discount_amount, '') : '—'}</td>
              <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(item.amount, '')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
        <div style={{ width: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(voucher.subtotal || 1100)}</span>
          </div>
          {Number(voucher.discount_amount) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#d32f2f' }}>
              <span>Discount:</span>
              <span>−{formatCurrency(voucher.discount_amount || 100)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #111', fontSize: '16px', fontWeight: 800 }}>
            <span>Total Payable:</span>
            <span>{formatCurrency(voucher.total_amount || 1000)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #ddd', paddingTop: '16px', textAlign: 'center', fontSize: '11px', color: '#666' }}>
        Thank you for your business! | Agre Billing System
      </div>
    </div>
  );
};

export const ThermalReceipt: React.FC<InvoiceProps> = ({ voucher, company }) => {
  return (
    <div className="receipt-thermal" style={{
      width: '58mm',
      padding: '8px',
      margin: '0 auto',
      fontFamily: 'monospace',
      fontSize: '11px',
      background: 'white',
      color: '#000',
    }}>
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
        {company.name || 'AGRE GENERAL STORE'}
      </div>
      <div style={{ textAlign: 'center', fontSize: '9px', marginBottom: '6px' }}>
        {company.phone ? `Ph: ${company.phone}` : ''}
      </div>
      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', margin: '4px 0' }}>
        <div>Bill: {voucher.voucher_number || 'SAL/000001'}</div>
        <div>Date: {voucher.date ? formatDateDMY(voucher.date) : '19/08/2026'}</div>
        <div>Cust: {voucher.party_name || 'Walk-in'}</div>
      </div>

      {/* Items */}
      <table style={{ width: '100%', fontSize: '10px' }}>
        <tbody>
          {(voucher.items || [
            { product_name: 'Rice 5kg', quantity: 5, rate: 120, amount: 600 },
            { product_name: 'Oil 1L', quantity: 2, rate: 250, amount: 500 },
          ]).map((item, idx) => (
            <tr key={idx}>
              <td>{item.product_name}</td>
              <td style={{ textAlign: 'right' }}>{item.quantity}x{item.rate}</td>
              <td style={{ textAlign: 'right' }}>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', marginTop: '6px', paddingTop: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px' }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(voucher.total_amount || 1000)}</span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '9px' }}>
        *** THANK YOU ***
      </div>
    </div>
  );
};
