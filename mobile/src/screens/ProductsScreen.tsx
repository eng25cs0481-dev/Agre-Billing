import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { formatCurrency } from '@agre/shared';
import { supabase } from '../lib/supabase';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/appStore';

interface ProductsScreenProps {
  onMenuPress: () => void;
}

export const ProductsScreen: React.FC<ProductsScreenProps> = ({ onMenuPress }) => {
  const insets = useSafeAreaInsets();
  const company = useAppStore(s => s.company);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Selected Product (Bottom Sheet)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  // Add Product Modal state
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  
  // 4 Pricing Tiers
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newRetailPrice, setNewRetailPrice] = useState('');
  const [newWholesalePrice, setNewWholesalePrice] = useState('');
  const [newSpecialPrice, setNewSpecialPrice] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    if (!company) return;
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [company]);

  const handleAddProduct = async () => {
    if (!newProductName.trim() || !newRetailPrice.trim()) {
      Alert.alert('Error', 'Product Name and Retail Price are required.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('products').insert([{
        name: newProductName,
        category: newProductCategory || 'General',
        current_stock: parseInt(newProductStock, 10) || 0,
        unit: 'pcs',
        cost_price: parseFloat(newCostPrice) || 0,
        selling_price: parseFloat(newRetailPrice) || 0,
        wholesale_price: parseFloat(newWholesalePrice) || 0,
        special_price: parseFloat(newSpecialPrice) || 0,
        company_id: company?.id
      }]);
      
      if (error) throw error;
      
      Alert.alert('Success', 'Product added successfully!');
      setAddModalVisible(false);
      
      // Reset form
      setNewProductName('');
      setNewProductCategory('');
      setNewProductStock('');
      setNewCostPrice('');
      setNewRetailPrice('');
      setNewWholesalePrice('');
      setNewSpecialPrice('');
      
      // Refresh list
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      Alert.alert('Error', 'Could not add product. Make sure special_price column exists in the database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dynamicCategories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
            <Feather name="menu" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Inventory</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Feather name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Dynamic Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {dynamicCategories.map((c) => (
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
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.list}>
          {filtered.length === 0 ? (
            <Text style={styles.emptyText}>No products found.</Text>
          ) : (
            filtered.map((item) => {
              const isLowStock = item.current_stock < (item.minimum_stock || 5);
              return (
                <TouchableOpacity key={item.id} activeOpacity={0.7} onPress={() => setSelectedProduct(item)}>
                  <View style={styles.productCard}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.productName}>{item.name}</Text>
                        {isLowStock && (
                          <View style={styles.lowBadge}>
                            <Text style={styles.lowBadgeText}>LOW STOCK</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.productSku}>{item.category || 'Uncategorized'}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.productPrice}>{formatCurrency(item.selling_price || 0)}</Text>
                      <Text style={[styles.productStock, isLowStock && { color: '#ef4444' }]}>
                        {item.current_stock || 0} {item.unit || 'pcs'} in stock
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Product Details Bottom Sheet */}
      <Modal visible={!!selectedProduct} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalOverlayBg} activeOpacity={1} onPress={() => setSelectedProduct(null)} />
          <View style={[styles.bottomSheet, { height: '55%' }]}>
            <View style={styles.sheetHandle} />
            
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>{selectedProduct?.name}</Text>
                <Text style={styles.sheetCategory}>{selectedProduct?.category || 'Uncategorized'}</Text>
              </View>
              <View style={styles.sheetStockBadge}>
                <Text style={styles.sheetStockText}>{selectedProduct?.current_stock} {selectedProduct?.unit}</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>PRICING TIERS</Text>
            
            <View style={styles.priceGrid}>
              <View style={styles.priceGridRow}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceBoxLabel}>Cost Price</Text>
                  <Text style={styles.priceBoxValue}>{formatCurrency(selectedProduct?.cost_price || 0)}</Text>
                </View>
                <View style={[styles.priceBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <Text style={[styles.priceBoxLabel, { color: '#3b82f6' }]}>Wholesale Price</Text>
                  <Text style={[styles.priceBoxValue, { color: '#2563eb' }]}>{formatCurrency(selectedProduct?.wholesale_price || 0)}</Text>
                </View>
              </View>

              <View style={styles.priceGridRow}>
                <View style={[styles.priceBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                  <Text style={[styles.priceBoxLabel, { color: '#22c55e' }]}>Retail Price</Text>
                  <Text style={[styles.priceBoxValue, { color: '#16a34a' }]}>{formatCurrency(selectedProduct?.selling_price || 0)}</Text>
                </View>
                <View style={[styles.priceBox, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
                  <Text style={[styles.priceBoxLabel, { color: '#f97316' }]}>Special Price</Text>
                  <Text style={[styles.priceBoxValue, { color: '#ea580c' }]}>{formatCurrency(selectedProduct?.special_price || 0)}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.closeSheetBtn} onPress={() => setSelectedProduct(null)}>
              <Text style={styles.closeSheetText}>Close Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <Modal visible={isAddModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalOverlayBg} activeOpacity={1} onPress={() => setAddModalVisible(false)} />
          <View style={[styles.bottomSheet, { height: '85%' }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Product</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Feather name="x" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput style={styles.input} value={newProductName} onChangeText={setNewProductName} placeholder="e.g. Rice 1kg" placeholderTextColor="#94a3b8" />
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Category</Text>
                  <TextInput style={styles.input} value={newProductCategory} onChangeText={setNewProductCategory} placeholder="e.g. Grocery" placeholderTextColor="#94a3b8" />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Opening Stock</Text>
                  <TextInput style={styles.input} value={newProductStock} onChangeText={setNewProductStock} keyboardType="numeric" placeholder="0" placeholderTextColor="#94a3b8" />
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>PRICING</Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Cost Price</Text>
                  <TextInput style={styles.input} value={newCostPrice} onChangeText={setNewCostPrice} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#94a3b8" />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Wholesale Price</Text>
                  <TextInput style={styles.input} value={newWholesalePrice} onChangeText={setNewWholesalePrice} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#94a3b8" />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Retail Price *</Text>
                  <TextInput style={styles.input} value={newRetailPrice} onChangeText={setNewRetailPrice} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#94a3b8" />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Special Price</Text>
                  <TextInput style={styles.input} value={newSpecialPrice} onChangeText={setNewSpecialPrice} keyboardType="numeric" placeholder="0.00" placeholderTextColor="#94a3b8" />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddProduct} disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>SAVE PRODUCT</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuBtn: {
    padding: 4,
    marginRight: 12,
  },
  title: { color: '#0f172a', fontSize: 20, fontWeight: '800' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700', marginLeft: 4 },
  searchSection: { paddingHorizontal: 16, marginBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    paddingVertical: 12,
    fontSize: 14,
  },
  chipRow: { flexDirection: 'row', marginTop: 12 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catChipActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  catChipText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  catChipTextActive: { color: '#2563eb' },
  list: { flex: 1, paddingHorizontal: 16 },
  productCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  productName: { color: '#0f172a', fontSize: 15, fontWeight: '700' },
  productSku: { color: '#64748b', fontSize: 12, marginTop: 4 },
  productPrice: { color: '#0f172a', fontSize: 16, fontWeight: '800' },
  productStock: { color: '#16a34a', fontSize: 12, fontWeight: '600', marginTop: 4 },
  lowBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  lowBadgeText: { color: '#ef4444', fontSize: 10, fontWeight: 'bold' },
  emptyText: { color: '#94a3b8', textAlign: 'center', marginTop: 32, fontStyle: 'italic' },
  
  // Modal / Bottom Sheet styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  bottomSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: -8,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sheetTitle: { color: '#0f172a', fontSize: 24, fontWeight: '900', marginBottom: 4 },
  sheetCategory: { color: '#64748b', fontSize: 14, fontWeight: '600' },
  sheetStockBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  sheetStockText: { color: '#16a34a', fontSize: 14, fontWeight: '800' },
  
  sectionTitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  priceGrid: {
    gap: 12,
  },
  priceGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  priceBoxLabel: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  priceBoxValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
  },
  closeSheetBtn: {
    marginTop: 'auto',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeSheetText: { color: '#0f172a', fontSize: 15, fontWeight: '700' },

  // Form styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  formGroup: { marginBottom: 16 },
  label: { color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    color: '#0f172a',
    padding: 12,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
