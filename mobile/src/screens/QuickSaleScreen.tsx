import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { formatCurrency, calculateBillTotals } from '@agre/shared';
import type { VoucherItemInput, PaymentMode } from '@agre/shared';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../stores/appStore';

interface QuickSaleProps {
  onBack: () => void;
  voucherType?: 'retail' | 'wholesale' | 'purchase' | null;
}

export const QuickSaleScreen: React.FC<QuickSaleProps> = ({ onBack, voucherType }) => {
  const insets = useSafeAreaInsets();
  const company = useAppStore(s => s.company);
  
  const [products, setProducts] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPartySuggestions, setShowPartySuggestions] = useState(false);

  const [customerName, setCustomerName] = useState(
    voucherType === 'wholesale' || voucherType === 'purchase' ? '' : 'Walk-in Customer'
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [cart, setCart] = useState<VoucherItemInput[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadProducts() {
      if (!company) return;
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('name');
        if (productsError) throw productsError;
        if (productsData) setProducts(productsData);

        const partyTable = voucherType === 'purchase' ? 'suppliers' : 'customers';
        const { data: partiesData, error: partiesError } = await supabase
          .from(partyTable)
          .select('*')
          .order('name');
        if (partiesError) console.error(`Error fetching ${partyTable}:`, partiesError);
        if (partiesData) setParties(partiesData);
      } catch (err) {
        console.error('Error fetching data for sale screen:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [voucherType, company]);

  const getDynamicRate = (product: any): number => {
    if (voucherType === 'wholesale') return product.wholesale_price || 0;
    if (voucherType === 'purchase') return product.cost_price || 0;
    return product.selling_price || 0; // Default to retail
  };

  const addToCart = (product: any) => {
    const rate = getDynamicRate(product);
    const existing = cart.find((i) => i.product_name === product.name);
    
    if (existing) {
      setCart(cart.map((i) => (i.product_name === product.name ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { product_name: product.name, quantity: 1, rate: rate, discount_amount: 0 }]);
    }
  };

  const updateQuantity = (name: string, delta: number) => {
    setCart(
      cart
        .map((i) => (i.product_name === name ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const totals = calculateBillTotals(cart);

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart is empty', 'Please add items before checkout.');
      return;
    }
    Alert.alert(
      `${voucherType === 'purchase' ? 'Purchase' : 'Sale'} Confirmed`,
      `Total: ${formatCurrency(totals.grandTotal)}\nPayment: ${paymentMode.toUpperCase()}\nParty: ${customerName}`,
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredParties = customerName.trim()
    ? parties.filter((p) => p.name?.toLowerCase().includes(customerName.toLowerCase()))
    : [];

  const handleSelectParty = (name: string) => {
    setCustomerName(name);
    setShowPartySuggestions(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {voucherType === 'wholesale' ? 'Wholesale Sale' : voucherType === 'purchase' ? 'Purchase Entry' : 'Retail Sale'}
        </Text>
        <TouchableOpacity onPress={() => setCart([])} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Customer & Payment Mode */}
      <View style={[styles.metaRow, { zIndex: 10 }]}>
        <View style={{ zIndex: 10 }}>
          <TextInput
            style={styles.customerInput}
            value={customerName}
            onChangeText={(text) => {
              setCustomerName(text);
              setShowPartySuggestions(true);
            }}
            onFocus={() => setShowPartySuggestions(true)}
            placeholder={voucherType === 'purchase' ? "Supplier Name" : "Customer Name"}
            placeholderTextColor="#94a3b8"
          />
          {showPartySuggestions && filteredParties.length > 0 && (
            <View style={styles.partySuggestions}>
              <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 150 }}>
                {filteredParties.map((party) => (
                  <TouchableOpacity
                    key={party.id}
                    style={styles.partyOption}
                    onPress={() => handleSelectParty(party.name)}
                  >
                    <Text style={styles.partyOptionText}>{party.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        <View style={styles.modeSelector}>
          {(['cash', 'upi'] as PaymentMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.modeBtn, paymentMode === mode && styles.modeBtnActive]}
              onPress={() => setPaymentMode(mode)}
            >
              <Text style={[styles.modeText, paymentMode === mode && styles.modeTextActive]}>
                {mode.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Product Catalog / Quick Add */}
      <View style={styles.catalogSection}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#94a3b8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products to add..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productChips}>
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ margin: 10 }} />
          ) : (
            filteredProducts.map((p) => (
              <TouchableOpacity key={p.id} style={styles.chip} onPress={() => addToCart(p)}>
                <Text style={styles.chipName}>{p.name}</Text>
                <Text style={styles.chipPrice}>{formatCurrency(getDynamicRate(p))}</Text>
              </TouchableOpacity>
            ))
          )}
          {!loading && filteredProducts.length === 0 && (
            <Text style={{ color: '#94a3b8', fontSize: 12, paddingVertical: 10 }}>No products found in inventory.</Text>
          )}
        </ScrollView>
      </View>

      {/* Cart Items List */}
      <ScrollView style={styles.cartList}>
        <Text style={styles.cartHeader}>CART ITEMS ({cart.length})</Text>
        {cart.length === 0 ? (
          <Text style={styles.emptyCart}>Tap any product above to add to cart</Text>
        ) : (
          cart.map((item) => (
            <View key={item.product_name} style={styles.cartItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.product_name}</Text>
                <Text style={styles.itemRate}>{formatCurrency(item.rate)} each</Text>
              </View>

              <View style={styles.qtyControl}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.product_name, -1)}>
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item.product_name, 1)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.itemTotal}>{formatCurrency(item.quantity * item.rate)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* Footer / Checkout */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
          <Text style={styles.totalValue}>{formatCurrency(totals.grandTotal)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={styles.checkoutText}>
            {voucherType === 'purchase' ? 'RECORD PURCHASE' : 'CONFIRM & BILL'} ({formatCurrency(totals.grandTotal)})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  backBtn: { padding: 4 },
  title: { color: '#0f172a', fontSize: 18, fontWeight: '800' },
  clearBtn: { padding: 4 },
  clearBtnText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
  metaRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#ffffff', zIndex: 10 },
  customerInput: {
    backgroundColor: '#ffffff',
    color: '#0f172a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    fontSize: 14,
  },
  partySuggestions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 20,
  },
  partyOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  partyOptionText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
  modeSelector: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modeBtnActive: { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
  modeText: { color: '#64748b', fontSize: 13, fontWeight: '700' },
  modeTextActive: { color: '#2563eb' },
  catalogSection: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#ffffff' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    color: '#0f172a',
    paddingVertical: 10,
    fontSize: 14,
  },
  productChips: { flexDirection: 'row' },
  chip: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 100,
  },
  chipName: { color: '#0f172a', fontSize: 13, fontWeight: '600' },
  chipPrice: { color: '#2563eb', fontSize: 12, fontWeight: 'bold', marginTop: 4 },
  cartList: { flex: 1, padding: 12 },
  cartHeader: { color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  emptyCart: { color: '#94a3b8', textAlign: 'center', marginTop: 30, fontSize: 13, fontStyle: 'italic' },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  itemName: { color: '#0f172a', fontSize: 14, fontWeight: '600' },
  itemRate: { color: '#64748b', fontSize: 12, marginTop: 2 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16 },
  qtyBtn: {
    backgroundColor: '#eff6ff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  qtyBtnText: { color: '#2563eb', fontSize: 18, fontWeight: 'bold' },
  qtyValue: { color: '#0f172a', marginHorizontal: 12, fontSize: 15, fontWeight: '700' },
  itemTotal: { color: '#0f172a', fontWeight: '800', fontSize: 14 },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 5,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  totalLabel: { color: '#64748b', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  totalValue: { color: '#16a34a', fontSize: 24, fontWeight: '900' },
  checkoutBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  checkoutText: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
});
