import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterListPage, { type Column } from '../../components/MasterListPage';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { SupplierWithBalance } from '@agre/shared/types';
import { api } from '../../services/api';

const columns: Column<SupplierWithBalance>[] = [
  { key: 'code', label: 'Code', width: '8%' },
  { key: 'name', label: 'Supplier Name', width: '28%' },
  { key: 'phone', label: 'Phone', width: '14%' },
  { key: 'city', label: 'City', width: '14%' },
  {
    key: 'outstanding_balance', label: 'Outstanding', width: '16%', className: 'num',
    render: (s: SupplierWithBalance) => (
      <span className={`amount ${s.outstanding_balance > 0 ? 'credit' : ''}`}>
        {formatCurrency(s.outstanding_balance)}
      </span>
    ),
  },
  {
    key: 'payment_terms', label: 'Terms', width: '10%',
    render: (s: SupplierWithBalance) => s.payment_terms ? `${s.payment_terms} days` : '—',
  },
];

import { useAppStore } from '../../stores/appStore';

export default function SuppliersPage() {
  const navigate = useNavigate();
  const company = useAppStore(s => s.company);
  const [suppliers, setSuppliers] = useState<SupplierWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    api.getSuppliers(company.id).then((data) => {
      setSuppliers(data);
      setLoading(false);
    });
  }, [company]);

  return (
    <MasterListPage
      title="Suppliers"
      columns={columns}
      data={suppliers}
      loading={loading}
      searchFields={['name', 'code', 'phone', 'city'] as any}
      onAdd={() => navigate('/masters/suppliers/new')}
      onEdit={(s: SupplierWithBalance) => navigate(`/masters/suppliers/${s.id}`)}
      addLabel="New Supplier"
    />
  );
}
