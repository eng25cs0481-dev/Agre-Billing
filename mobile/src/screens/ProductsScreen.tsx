import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { formatCurrency } from '@agre/shared/utils/currency';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  current_stock: number;
  minimum_stock: number;
}

const DEMO_PRODUCTS: ProductItem[] = [];

export const ProductsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Grocery', 'Dairy', 'Beverages'];

  const filtered = DEMO_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Products & Stock ({filtered.length})</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search product name or SKU..."
          placeholderTextColor="#5c6bc0"
          value={search}
          onChangeText={setSearch}
        />

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.catChip, selectedCategory === c && styles.catChipActive]}
              onPress={() => setSelectedCategory(c)}
            >
              <Text style={[styles.catChipText, selectedCategory === c && styles.catChipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <ScrollView style={styles.list}>
        {filtered.map((item) => {
          const isLowStock = item.current_stock < item.minimum_stock;
          return (
            <View key={item.id} style={styles.productCard}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.productName}>{item.name}</Text>
                  {isLowStock && (
                    <View style={styles.lowBadge}>
                      <Text style={styles.lowBadgeText}>LOW STOCK</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.productSku}>{item.sku} • {item.category}</Text>
                <Text style={styles.productCost}>Cost: {formatCurrency(item.cost_price)}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.productPrice}>{formatCurrency(item.selling_price)}</Text>
                <Text style={[styles.productStock, isLowStock && { color: '#ef5350' }]}>
                  {item.current_stock} {item.unit} in stock
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2358',
    backgroundColor: '#0d1038',
  },
  title: { color: '#ffab40', fontSize: 16, fontWeight: '800' },
  searchSection: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#1e2358' },
  searchInput: {
    backgroundColor: '#0d1133',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    fontSize: 13,
  },
  chipRow: { flexDirection: 'row', marginTop: 8 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#111538',
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  catChipActive: { backgroundColor: '#1a237e', borderColor: '#3949ab' },
  catChipText: { color: '#9fa8da', fontSize: 11, fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
  list: { flex: 1, padding: 12 },
  productCard: {
    backgroundColor: '#111538',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productName: { color: '#e8eaf6', fontSize: 13, fontWeight: '700' },
  productSku: { color: '#5c6bc0', fontSize: 11, marginTop: 2 },
  productCost: { color: '#9fa8da', fontSize: 10.5, marginTop: 4 },
  productPrice: { color: '#fff9c4', fontSize: 15, fontWeight: '800' },
  productStock: { color: '#66bb6a', fontSize: 11, fontWeight: '600', marginTop: 2 },
  lowBadge: {
    backgroundColor: 'rgba(239, 83, 80, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  lowBadgeText: { color: '#ef5350', fontSize: 9, fontWeight: 'bold' },
});
