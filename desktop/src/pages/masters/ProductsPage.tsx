import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterListPage, { type Column } from '../../components/MasterListPage';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { ProductWithStock } from '@agre/shared/types';
import { api } from '../../services/api';

const columns: Column<ProductWithStock>[] = [
  { key: 'name', label: 'Product Name', width: '30%' },
  { key: 'sku', label: 'SKU', width: '12%', className: '' },
  { key: 'category_name', label: 'Category', width: '12%' },
  {
    key: 'selling_price', label: 'Sell Price', width: '12%', className: 'num',
    render: (p: ProductWithStock) => <span className="amount">{formatCurrency(p.selling_price)}</span>,
  },
  {
    key: 'cost_price', label: 'Cost Price', width: '12%', className: 'num',
    render: (p: ProductWithStock) => <span className="amount">{formatCurrency(p.cost_price)}</span>,
  },
  {
    key: 'current_stock', label: 'Stock', width: '10%', className: 'num',
    render: (p: ProductWithStock) => (
      <span style={{
        color: p.current_stock < p.minimum_stock ? 'var(--color-error)' : 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
      }}>
        {p.current_stock} {p.unit_symbol}
      </span>
    ),
  },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <MasterListPage
      title="Products"
      columns={columns}
      data={products}
      loading={loading}
      searchFields={['name', 'sku', 'category_name'] as any}
      onAdd={() => navigate('/masters/products/new')}
      onEdit={(p: ProductWithStock) => navigate(`/masters/products/${p.id}`)}
      addLabel="New Product"
    />
  );
}
