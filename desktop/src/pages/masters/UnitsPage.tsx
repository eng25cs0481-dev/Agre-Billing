import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import MasterListPage, { type Column } from '../../components/MasterListPage';

interface UnitItem {
  id: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

const DEFAULT_UNITS: UnitItem[] = [
  { id: '1', name: 'Pieces', symbol: 'Pcs', decimal_places: 0 },
  { id: '2', name: 'Kilograms', symbol: 'Kg', decimal_places: 3 },
  { id: '3', name: 'Litres', symbol: 'Ltr', decimal_places: 3 },
  { id: '4', name: 'Boxes', symbol: 'Box', decimal_places: 0 },
  { id: '5', name: 'Grams', symbol: 'g', decimal_places: 0 },
  { id: '6', name: 'Metres', symbol: 'm', decimal_places: 2 },
  { id: '7', name: 'Packets', symbol: 'Pkt', decimal_places: 0 },
  { id: '8', name: 'Dozens', symbol: 'Doz', decimal_places: 0 },
  { id: '9', name: 'Numbers', symbol: 'Nos', decimal_places: 0 },
];

const columns: Column<UnitItem>[] = [
  { key: 'symbol', label: 'Unit Symbol', width: '25%' },
  { key: 'name', label: 'Formal Name', width: '45%' },
  { key: 'decimal_places', label: 'Decimal Places', width: '30%', className: 'num' },
];

export default function UnitsPage() {
  const [units, setUnits] = useState<UnitItem[]>(DEFAULT_UNITS);
  const [loading, setLoading] = useState(false);

  const fetchUnits = async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data } = await supabase.from('units').select('*').order('name');
    if (data && data.length > 0) {
      setUnits(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleAddUnit = async () => {
    const symbol = prompt('Enter Unit Symbol (e.g. Box, Mtr, Roll, Set, Pair):');
    if (!symbol || !symbol.trim()) return;

    const name = prompt('Enter Formal Name (e.g. Boxes, Metres):', symbol);

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('units').insert([{ symbol: symbol.trim(), name: (name || symbol).trim(), decimal_places: 0 }]);
      if (error) {
        alert('Database error: ' + error.message);
        return;
      }
      fetchUnits();
    } else {
      setUnits([...units, { id: Date.now().toString(), symbol: symbol.trim(), name: (name || symbol).trim(), decimal_places: 0 }]);
    }
  };

  const handleDeleteUnit = async (u: UnitItem) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete unit "${u.symbol}"?`);
    if (!confirmDelete) return;

    if (isSupabaseConfigured() && u.id.length > 10) {
      const { error } = await supabase.from('units').delete().eq('id', u.id);
      if (error) {
        alert('Database error: ' + error.message);
        return;
      }
      fetchUnits();
    } else {
      setUnits((prev) => prev.filter((item) => item.id !== u.id && item.symbol !== u.symbol));
    }
  };

  return (
    <MasterListPage
      title="Units of Measure"
      columns={columns}
      data={units}
      loading={loading}
      searchFields={['symbol', 'name'] as any}
      addLabel="New Unit"
      onAdd={handleAddUnit}
      onDelete={handleDeleteUnit}
    />
  );
}
