import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import MasterListPage, { type Column } from '../../components/MasterListPage';

interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: '1', name: 'Grocery', description: 'Grains, Pulses, Oils, Spices', created_at: '' },
  { id: '2', name: 'Dairy Products', description: 'Milk, Butter, Cheese, Ghee', created_at: '' },
  { id: '3', name: 'Beverages', description: 'Tea, Coffee, Juices, Cold Drinks', created_at: '' },
  { id: '4', name: 'Packaged Food', description: 'Biscuits, Snacks, Noodles', created_at: '' },
  { id: '5', name: 'Personal Care', description: 'Soaps, Shampoos, Cosmetics', created_at: '' },
  { id: '6', name: 'General', description: 'Uncategorized / Primary', created_at: '' },
];

const columns: Column<CategoryItem>[] = [
  { key: 'name', label: 'Category Name', width: '40%' },
  { key: 'description', label: 'Description / Notes', width: '60%' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data && data.length > 0) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const name = prompt('Enter New Category / Group Name (e.g. Electronics, Garments, Hardware):');
    if (!name || !name.trim()) return;

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from('categories').insert([{ name: name.trim() }]);
      if (error) {
        alert('Database error: ' + error.message);
        return;
      }
      fetchCategories();
    } else {
      setCategories([...categories, { id: Date.now().toString(), name: name.trim(), created_at: '' }]);
    }
  };

  return (
    <MasterListPage
      title="Product Categories / Groups"
      columns={columns}
      data={categories}
      loading={loading}
      searchFields={['name', 'description'] as any}
      addLabel="New Category"
      onAdd={handleAddCategory}
      onEdit={(c) => {
        const newName = prompt('Rename Category:', c.name);
        if (newName && isSupabaseConfigured()) {
          supabase.from('categories').update({ name: newName }).eq('id', c.id).then(fetchCategories);
        }
      }}
    />
  );
}
