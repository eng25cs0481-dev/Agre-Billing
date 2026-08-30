import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MasterListPage, { type Column } from '../../components/MasterListPage';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { CustomerWithBalance } from '@agre/shared/types';
import { api } from '../../services/api';

const columns: Column<CustomerWithBalance>[] = [
  { key: 'code', label: 'Code', width: '8%' },
  { key: 'name', label: 'Customer Name', width: '25%' },
  { key: 'phone', label: 'Phone', width: '14%' },
  { key: 'city', label: 'City', width: '12%' },
  {
    key: 'outstanding_balance', label: 'Outstanding', width: '14%', className: 'num',
    render: (c: CustomerWithBalance) => (
      <span className={`amount ${c.outstanding_balance > 0 ? 'debit' : ''}`}>
        {formatCurrency(c.outstanding_balance)}
      </span>
    ),
  },
  {
    key: 'credit_limit', label: 'Credit Limit', width: '14%', className: 'num',
    render: (c: CustomerWithBalance) => c.credit_limit ? (
      <span className="amount">{formatCurrency(c.credit_limit)}</span>
    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>,
  },
];

import { useAppStore } from '../../stores/appStore';

export default function CustomersPage() {
  const navigate = useNavigate();
  const company = useAppStore(s => s.company);
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company) return;
    api.getCustomers(company.id).then((data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, [company]);

  return (
    <MasterListPage
      title="Customers"
      columns={columns}
      data={customers}
      loading={loading}
      searchFields={['name', 'code', 'phone', 'city'] as any}
      onAdd={() => navigate('/masters/customers/new')}
      onEdit={(c: CustomerWithBalance) => navigate(`/masters/customers/${c.id}`)}
      addLabel="New Customer"
    />
  );
}
