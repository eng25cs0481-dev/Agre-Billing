import React, { useState, useEffect } from 'react';
import MasterListPage, { type Column } from '../../components/MasterListPage';
import { formatCurrency } from '@agre/shared/utils/currency';
import type { Ledger } from '@agre/shared/types';
import { api } from '../../services/api';

const columns: Column<any>[] = [
  { key: 'name', label: 'Ledger Name', width: '35%' },
  { key: 'group_name', label: 'Under Group', width: '25%' },
  {
    key: 'opening_balance',
    label: 'Opening Balance',
    width: '20%',
    className: 'num',
    render: (l: any) => (
      <span className="amount">
        {formatCurrency(l.opening_balance || 0)} {l.opening_balance_type ? `(${l.opening_balance_type.toUpperCase()})` : ''}
      </span>
    ),
  },
  {
    key: 'balance',
    label: 'Current Balance',
    width: '20%',
    className: 'num',
    render: (l: any) => (
      <span className="amount" style={{ color: 'var(--color-total)' }}>
        {formatCurrency(l.balance || 0)}
      </span>
    ),
  },
];

export default function LedgersPage() {
  const [ledgers, setLedgers] = useState<(Ledger & { group_name: string; balance: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLedgers().then((data) => {
      setLedgers(data);
      setLoading(false);
    });
  }, []);

  return (
    <MasterListPage
      title="Ledgers"
      columns={columns}
      data={ledgers}
      loading={loading}
      searchFields={['name', 'group_name'] as any}
      addLabel="New Ledger"
      onAdd={() => alert('Create new Ledger in Supabase')}
      onEdit={(l: any) => alert(`Edit Ledger: ${l.name}`)}
    />
  );
}
