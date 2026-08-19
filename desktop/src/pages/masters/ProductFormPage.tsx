import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const DEFAULT_CATEGORIES = ['Grocery', 'Dairy Products', 'Beverages', 'Packaged Food', 'Personal Care', 'Primary / General'];
const DEFAULT_UNITS = ['Pcs', 'Kg', 'Ltr', 'Box', 'g', 'm', 'Pkt', 'Doz', 'Nos'];

export default function ProductFormPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [units, setUnits] = useState<string[]>(DEFAULT_UNITS);

  const [categoryName, setCategoryName] = useState('Grocery');
  const [unitName, setUnitName] = useState('Pcs');
  const [costPrice, setCostPrice] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [openingStock, setOpeningStock] = useState<number | ''>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // Fetch real categories and units from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.from('categories').select('name').order('name').then(({ data }) => {
      if (data && data.length > 0) {
        const catNames = data.map((c: any) => c.name);
        setCategories(Array.from(new Set([...catNames, ...DEFAULT_CATEGORIES])));
      }
    });

    supabase.from('units').select('symbol').order('symbol').then(({ data }) => {
      if (data && data.length > 0) {
        const unitSymbols = data.map((u: any) => u.symbol);
        setUnits(Array.from(new Set([...unitSymbols, ...DEFAULT_UNITS])));
      }
    });
  }, []);

  const handleCategoryChange = async (val: string) => {
    if (val === '__NEW__') {
      const customCat = prompt('Enter New Category / Group Name:');
      if (customCat && customCat.trim()) {
        const clean = customCat.trim();
        setCategories((prev) => [clean, ...prev]);
        setCategoryName(clean);

        if (isSupabaseConfigured()) {
          await supabase.from('categories').insert([{ name: clean }]);
        }
      }
    } else {
      setCategoryName(val);
    }
  };

  const handleUnitChange = async (val: string) => {
    if (val === '__NEW__') {
      const customUnit = prompt('Enter New Unit Symbol (e.g. Roll, Set, Quintal):');
      if (customUnit && customUnit.trim()) {
        const clean = customUnit.trim();
        setUnits((prev) => [clean, ...prev]);
        setUnitName(clean);

        if (isSupabaseConfigured()) {
          await supabase.from('units').insert([{ symbol: clean, name: clean, decimal_places: 0 }]);
        }
      }
    } else {
      setUnitName(val);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter Product / Item Name');
      return;
    }

    setSaving(true);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.from('products').insert([
          {
            name: name.trim(),
            sku: sku.trim() || undefined,
            cost_price: Number(costPrice) || 0,
            selling_price: Number(sellingPrice) || 0,
            minimum_stock: Number(minStock) || 0,
            is_active: true,
          },
        ]);

        if (error) {
          alert('Database Error: ' + error.message);
          setSaving(false);
          return;
        }
      }

      setSavedMessage(true);
      setTimeout(() => {
        navigate('/masters/products');
      }, 700);
    } catch (err: any) {
      alert('Error saving product: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  useKeyboardShortcuts([
    { key: 'a', ctrl: true, action: handleSave, description: 'Accept' },
    { key: 's', ctrl: true, action: handleSave, description: 'Save' },
    { key: 'Escape', action: () => navigate('/masters/products'), description: 'Quit' },
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 'bold', color: '#0c3c78' }}>
          Stock Item Creation
        </span>
        {savedMessage && (
          <span style={{ color: '#15803d', fontWeight: 'bold', fontSize: 12 }}>
            ✓ Item Created Successfully
          </span>
        )}
      </div>

      {/* Main Tally Frame */}
      <div className="tp-table-wrap" style={{ flex: 1, padding: 16, background: '#edf7ee' }}>
        <div style={{ maxWidth: 650, margin: '0 auto', background: '#ffffff', border: '2px solid #0c3c78', padding: 20, boxShadow: '0 4px 12px rgba(12,60,120,0.1)' }}>
          {/* Header */}
          <div style={{ background: '#0c3c78', color: '#fff', padding: '6px 12px', fontWeight: 'bold', margin: '-20px -20px 20px -20px', fontSize: 13 }}>
            Stock Item Creation
          </div>

          {/* Name & SKU */}
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 140, fontWeight: 700, color: '#1f2937' }}>Name</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input
              type="text"
              className="tp-party-input"
              style={{ flex: 1, fontWeight: 700 }}
              placeholder="e.g. Basmati Rice 5kg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
            <span style={{ width: 140, color: '#4b5563' }}>(alias / SKU)</span>
            <span style={{ marginRight: 8 }}>:</span>
            <input
              type="text"
              className="tp-party-input"
              style={{ flex: 1 }}
              placeholder="e.g. RICE-BAS-5"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </div>

          <div style={{ borderTop: '1px solid #cadfe8', paddingTop: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 800, color: '#0c3c78', fontSize: 11.5, textTransform: 'uppercase' }}>
                Classification & Units
              </span>
              <span style={{ fontSize: 10.5, color: '#0c3c78', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/masters/categories')}>
                Manage Categories
              </span>
            </div>

            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 140, fontWeight: 600 }}>Under</span>
              <span style={{ marginRight: 8 }}>:</span>
              <select
                className="tp-party-input"
                style={{ flex: 1 }}
                value={categoryName}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                <option value="__NEW__" style={{ fontWeight: 'bold', color: '#0c3c78' }}>
                  + [Create New Category...]
                </option>
              </select>
            </div>

            <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center' }}>
              <span style={{ width: 140, fontWeight: 600 }}>Units</span>
              <span style={{ marginRight: 8 }}>:</span>
              <select
                className="tp-party-input"
                style={{ flex: 1 }}
                value={unitName}
                onChange={(e) => handleUnitChange(e.target.value)}
              >
                {units.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
                <option value="__NEW__" style={{ fontWeight: 'bold', color: '#0c3c78' }}>
                  + [Create New Unit...]
                </option>
              </select>
            </div>
          </div>

          {/* Pricing & Stock Details */}
          <div style={{ borderTop: '1px solid #cadfe8', paddingTop: 12, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, color: '#0c3c78', fontSize: 11.5, marginBottom: 10, textTransform: 'uppercase' }}>
              Standard Rates & Reorder
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 100, fontWeight: 600 }}>Cost Price (₹)</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="number"
                  className="tp-party-input"
                  style={{ width: 110, textAlign: 'right', fontFamily: 'var(--font-mono)' }}
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(parseFloat(e.target.value) || '')}
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 100, fontWeight: 700, color: '#0c3c78' }}>Sell Price (₹)</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="number"
                  className="tp-party-input"
                  style={{ width: 110, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(parseFloat(e.target.value) || '')}
                  min="0"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 100, color: '#4b5563' }}>Opening Qty</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="number"
                  className="tp-party-input"
                  style={{ width: 110, textAlign: 'right' }}
                  placeholder="0"
                  value={openingStock}
                  onChange={(e) => setOpeningStock(parseFloat(e.target.value) || '')}
                  min="0"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 100, color: '#4b5563' }}>Min. Stock</span>
                <span style={{ marginRight: 6 }}>:</span>
                <input
                  type="number"
                  className="tp-party-input"
                  style={{ width: 110, textAlign: 'right' }}
                  placeholder="0"
                  value={minStock}
                  onChange={(e) => setMinStock(parseFloat(e.target.value) || '')}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button className="tp-btn" onClick={() => navigate('/masters/products')}>
              Quit (Esc)
            </button>
            <button className="tp-btn primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Accept (^A)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
