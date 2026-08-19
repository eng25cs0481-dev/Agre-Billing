import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { formatCurrency } from '@agre/shared/utils/currency';
import { calculateBillTotals } from '@agre/shared/calculations/billing';
import type { VoucherItemInput, PaymentMode } from '@agre/shared/types';

interface QuickSaleProps {
  onBack: () => void;
}

const AVAILABLE_PRODUCTS: Array<{ id: string; name: string; rate: number; stock: number; unit: string }> = [];

export const QuickSaleScreen: React.FC<QuickSaleProps> = ({ onBack }) => {
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [cart, setCart] = useState<VoucherItemInput[]>([]);
  const [search, setSearch] = useState('');

  const addToCart = (product: typeof AVAILABLE_PRODUCTS[0]) => {
    const existing = cart.find((i) => i.product_name === product.name);
    if (existing) {
      setCart(cart.map((i) => (i.product_name === product.name ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setCart([...cart, { product_name: product.name, quantity: 1, rate: product.rate, discount_amount: 0 }]);
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
      'Sale Confirmed',
      `Bill Total: ${formatCurrency(totals.grandTotal)}\nPayment: ${paymentMode.toUpperCase()}\nCustomer: ${customerName}`,
      [{ text: 'OK', onPress: onBack }]
    );
  };

  const filteredProducts = AVAILABLE_PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Sale (Mobile POS)</Text>
        <TouchableOpacity onPress={() => setCart([])}>
          <Text style={styles.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Customer & Payment Mode */}
      <View style={styles.metaRow}>
        <TextInput
          style={styles.customerInput}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Customer Name"
          placeholderTextColor="#5c6bc0"
        />
        <View style={styles.modeSelector}>
          {(['cash', 'upi', 'credit'] as PaymentMode[]).map((mode) => (
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
        <TextInput
          style={styles.searchInput}
          placeholder="Search products to add..."
          placeholderTextColor="#5c6bc0"
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productChips}>
          {filteredProducts.map((p) => (
            <TouchableOpacity key={p.id} style={styles.chip} onPress={() => addToCart(p)}>
              <Text style={styles.chipName}>{p.name}</Text>
              <Text style={styles.chipPrice}>₹{p.rate}</Text>
            </TouchableOpacity>
          ))}
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
                <Text style={styles.itemRate}>₹{item.rate} each</Text>
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
          <Text style={styles.checkoutText}>CONFIRM & BILL (₹{totals.grandTotal})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0e27' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2358',
  },
  backBtn: { color: '#ffab40', fontWeight: 'bold' },
  title: { color: '#e8eaf6', fontSize: 16, fontWeight: '700' },
  clearBtn: { color: '#ef5350', fontSize: 13 },
  metaRow: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#1e2358' },
  customerInput: {
    backgroundColor: '#0d1133',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    marginBottom: 8,
  },
  modeSelector: { flexDirection: 'row', gap: 8 },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 4,
    backgroundColor: '#111538',
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  modeBtnActive: { backgroundColor: '#1a237e', borderColor: '#3949ab' },
  modeText: { color: '#9fa8da', fontSize: 12, fontWeight: 'bold' },
  modeTextActive: { color: '#fff' },
  catalogSection: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#1e2358' },
  searchInput: {
    backgroundColor: '#0d1133',
    color: '#fff',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    marginBottom: 8,
    fontSize: 13,
  },
  productChips: { flexDirection: 'row' },
  chip: {
    backgroundColor: '#151940',
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  chipName: { color: '#e8eaf6', fontSize: 12, fontWeight: '600' },
  chipPrice: { color: '#ffab40', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  cartList: { flex: 1, padding: 12 },
  cartHeader: { color: '#9fa8da', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  emptyCart: { color: '#5c6bc0', textAlign: 'center', marginTop: 30, fontSize: 13 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111538',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  itemName: { color: '#e8eaf6', fontSize: 13, fontWeight: '600' },
  itemRate: { color: '#9fa8da', fontSize: 11 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  qtyBtn: {
    backgroundColor: '#1a237e',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  qtyValue: { color: '#fff', marginHorizontal: 8, fontSize: 14, fontWeight: 'bold' },
  itemTotal: { color: '#fff9c4', fontWeight: 'bold', fontSize: 13 },
  footer: {
    padding: 16,
    backgroundColor: '#0d1038',
    borderTopWidth: 1,
    borderTopColor: '#1e2358',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { color: '#9fa8da', fontSize: 12, fontWeight: '700' },
  totalValue: { color: '#ffcc02', fontSize: 20, fontWeight: '800' },
  checkoutBtn: {
    backgroundColor: '#ff6f00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: { color: '#0a0e27', fontSize: 15, fontWeight: '800' },
});
