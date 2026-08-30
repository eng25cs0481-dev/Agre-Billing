import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import { formatCurrency } from '@agre/shared/utils/currency';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

const COLORS = [
  '#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
];

type AnalyticsTab = 'overview' | 'items' | 'categories' | 'geography' | 'customers';

interface MonthlyItem {
  month: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface CategoryData {
  category_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface GeoData {
  state: string;
  district: string;
  city: string;
  total_revenue: number;
  invoice_count: number;
}

interface CustomerData {
  customer_name: string;
  total_revenue: number;
  invoice_count: number;
}

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const company = useAppStore((s) => s.company);
  const currentYear = new Date().getFullYear();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  const [monthlyItems, setMonthlyItems] = useState<MonthlyItem[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [geography, setGeography] = useState<GeoData[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  const startDate = `${year}-04-01`;
  const endDate = `${year + 1}-03-31`;

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        if (!company) return;
        const [mi, cat, geo, cust] = await Promise.all([
          api.getAnalyticsMonthlyItems(company.id, year),
          api.getAnalyticsCategories(company.id, startDate, endDate),
          api.getAnalyticsGeography(company.id, startDate, endDate),
          api.getAnalyticsCustomers(company.id, startDate, endDate),
        ]);
        setMonthlyItems(mi);
        setCategories(cat);
        setGeography(geo);
        setCustomers(cust);
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [company?.id, year, startDate, endDate]);

  useKeyboardShortcuts([
    { key: 'Escape', action: () => navigate('/'), description: 'Back' },
  ]);

  // Aggregate monthly revenue for the trend line
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    monthlyItems.forEach((row) => {
      map.set(row.month, (map.get(row.month) || 0) + Number(row.total_revenue));
    });
    return Array.from(map.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [monthlyItems]);

  // Top 10 products by revenue
  const topProducts = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    monthlyItems.forEach((row) => {
      const prev = map.get(row.product_name) || { qty: 0, revenue: 0 };
      map.set(row.product_name, {
        qty: prev.qty + Number(row.total_quantity),
        revenue: prev.revenue + Number(row.total_revenue),
      });
    });
    return Array.from(map.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [monthlyItems]);

  // Summary stats
  const totalRevenue = monthlyRevenue.reduce((s, r) => s + r.revenue, 0);
  const totalInvoices = customers.reduce((s, c) => s + Number(c.invoice_count), 0);
  const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  const tabs: { key: AnalyticsTab; label: string }[] = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'items', label: '📦 Item Trends' },
    { key: 'categories', label: '🏷️ Categories' },
    { key: 'geography', label: '🗺️ Geography' },
    { key: 'customers', label: '👥 Customers' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 'bold', color: '#0c3c78' }}>
            📈 Business Analytics Dashboard
          </span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{
              background: '#fff', border: '1px solid #94bde0', padding: '2px 8px',
              fontSize: 12, fontWeight: 'bold', color: '#0c3c78',
            }}
          >
            {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
              <option key={y} value={y}>FY {y}–{y + 1}</option>
            ))}
          </select>
        </div>
        {loading && <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: 11 }}>Loading analytics...</span>}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '5px 14px', fontSize: 11.5, fontWeight: activeTab === tab.key ? 800 : 600,
              background: activeTab === tab.key ? '#0c3c78' : '#e1eff8',
              color: activeTab === tab.key ? '#fff' : '#0c3c78',
              border: '1px solid #94bde0', cursor: 'pointer', borderRadius: '3px 3px 0 0',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', background: '#ffffff', border: '1px solid #cadfe8', padding: 16 }}>
        {activeTab === 'overview' && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              <SummaryCard label="Total Revenue" value={`₹${formatCurrency(totalRevenue, '')}`} color="#2563eb" />
              <SummaryCard label="Total Invoices" value={String(totalInvoices)} color="#10b981" />
              <SummaryCard label="Avg Order Value" value={`₹${formatCurrency(avgOrderValue, '')}`} color="#f59e0b" />
              <SummaryCard label="Top Customers" value={String(customers.length)} color="#8b5cf6" />
            </div>

            {/* Revenue Trend */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78', marginBottom: 8 }}>Monthly Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} dot={{ fill: '#2563eb', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Quick view: Category Pie + Top Products */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78', marginBottom: 8 }}>Category Split</h3>
                {categories.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categories}
                        dataKey="total_revenue"
                        nameKey="category_name"
                        cx="50%" cy="50%"
                        outerRadius={70} innerRadius={35}
                        label={({ category_name, percent }) => `${category_name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categories.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No category data for this period" />
                )}
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78', marginBottom: 8 }}>Top 10 Products</h3>
                {topProducts.length > 0 ? (
                  <div style={{ maxHeight: 200, overflow: 'auto' }}>
                    {topProducts.map((p, i) => (
                      <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9', fontSize: 11.5 }}>
                        <span><strong style={{ color: COLORS[i % COLORS.length] }}>#{i + 1}</strong> {p.name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>₹{formatCurrency(p.revenue, '')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState text="No product sales data for this period" />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78', marginBottom: 12 }}>Item-wise Monthly Sales</h3>
            {topProducts.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]}>
                      {topProducts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Detailed table */}
                <table className="tp-table" style={{ marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>#</th>
                      <th>Product Name</th>
                      <th className="num" style={{ width: '18%' }}>Qty Sold</th>
                      <th className="num" style={{ width: '22%' }}>Revenue (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={p.name}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td className="num">{p.qty.toLocaleString('en-IN')}</td>
                        <td className="num" style={{ fontWeight: 700 }}>₹{formatCurrency(p.revenue, '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <EmptyState text="No item sales data available for this financial year" />
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78', marginBottom: 12 }}>Category-wise Revenue</h3>
            {categories.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categories}
                      dataKey="total_revenue"
                      nameKey="category_name"
                      cx="50%" cy="50%"
                      outerRadius={100} innerRadius={50}
                      label={({ category_name, percent }) => `${category_name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {categories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>

                <table className="tp-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category</th>
                      <th className="num">Qty Sold</th>
                      <th className="num">Revenue (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c, i) => (
                      <tr key={c.category_name}>
                        <td><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], marginRight: 6 }} />{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{c.category_name}</td>
                        <td className="num">{Number(c.total_quantity).toLocaleString('en-IN')}</td>
                        <td className="num" style={{ fontWeight: 700 }}>₹{formatCurrency(Number(c.total_revenue), '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState text="No category data available for this period" />
            )}
          </div>
        )}

        {activeTab === 'geography' && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78', marginBottom: 12 }}>Regional Sales (State → District → City)</h3>
            {geography.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={geography.slice(0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="city" type="category" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Bar dataKey="total_revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                      {geography.slice(0, 15).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <table className="tp-table" style={{ marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>#</th>
                      <th>State</th>
                      <th>District</th>
                      <th>City</th>
                      <th className="num" style={{ width: '14%' }}>Invoices</th>
                      <th className="num" style={{ width: '20%' }}>Revenue (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geography.map((g, i) => (
                      <tr key={`${g.state}-${g.district}-${g.city}`}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{g.state}</td>
                        <td>{g.district}</td>
                        <td>{g.city}</td>
                        <td className="num">{Number(g.invoice_count).toLocaleString('en-IN')}</td>
                        <td className="num" style={{ fontWeight: 700 }}>₹{formatCurrency(Number(g.total_revenue), '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <EmptyState text="No geographic data available. Ensure customers have City, District, and State filled in." />
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: '#0c3c78', marginBottom: 12 }}>Top Customers (by Revenue)</h3>
            {customers.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={customers.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="customer_name" type="category" tick={{ fontSize: 10 }} width={150} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                    <Bar dataKey="total_revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                      {customers.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                <table className="tp-table" style={{ marginTop: 16 }}>
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>Rank</th>
                      <th>Customer Name</th>
                      <th className="num" style={{ width: '14%' }}>Total Invoices</th>
                      <th className="num" style={{ width: '22%' }}>Total Revenue (₹)</th>
                      <th className="num" style={{ width: '18%' }}>Avg Order (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => {
                      const avg = Number(c.invoice_count) > 0 ? Number(c.total_revenue) / Number(c.invoice_count) : 0;
                      return (
                        <tr key={c.customer_name}>
                          <td style={{ fontWeight: 800, color: i < 3 ? '#f59e0b' : '#64748b' }}>
                            {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                          </td>
                          <td style={{ fontWeight: 600 }}>{c.customer_name}</td>
                          <td className="num">{Number(c.invoice_count).toLocaleString('en-IN')}</td>
                          <td className="num" style={{ fontWeight: 700, color: '#0c3c78' }}>₹{formatCurrency(Number(c.total_revenue), '')}</td>
                          <td className="num">₹{formatCurrency(avg, '')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </>
            ) : (
              <EmptyState text="No customer sales data available for this period" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: '#ffffff', border: `2px solid ${color}20`, borderLeft: `4px solid ${color}`,
      padding: '12px 16px', borderRadius: 4, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color, fontFamily: 'var(--font-mono)', marginTop: 4 }}>{value}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>
      {text}
    </div>
  );
}
