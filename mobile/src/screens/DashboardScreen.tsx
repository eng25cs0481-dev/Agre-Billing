import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { formatCurrency } from '@agre/shared';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../stores/appStore';

interface DashboardProps {
  onNavigate: (screen: string) => void;
  onMenuPress: () => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate, onMenuPress }) => {
  const insets = useSafeAreaInsets();
  const company = useAppStore(s => s.company);
  
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Placeholder metrics
  const todaySales = 0;
  const billsCount = 0;

  useEffect(() => {
    async function loadDashboardData() {
      if (!company) return;
      try {
        const { count: itemsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (itemsCount !== null) setTotalItems(itemsCount);
        if (customersCount !== null) setTotalCustomers(customersCount);
        if (prodData) setProducts(prodData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [company]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header with Hamburger */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onMenuPress} style={styles.menuBtn}>
            <Feather name="menu" size={24} color="#0f172a" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.shopName}>{company?.name || 'Agre Billing'}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <Feather name="bell" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity style={styles.newSaleBtn} onPress={() => onNavigate('sale')}>
          <View style={styles.newSaleGradient}>
            <Feather name="plus-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.newSaleBtnText}>New Sale Invoice</Text>
          </View>
        </TouchableOpacity>

        {/* KPI Row 1: Today's Sales */}
        <View style={styles.kpiCardFull}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>TODAY'S SALES</Text>
            <Feather name="trending-up" size={16} color="#16a34a" />
          </View>
          <Text style={styles.kpiValueLarge}>{formatCurrency(todaySales)}</Text>
          <Text style={styles.kpiSub}>{billsCount} Invoices Created</Text>
        </View>

        {/* KPI Row 2: Items & Customers */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>TOTAL ITEMS</Text>
              <Feather name="package" size={16} color="#2563eb" />
            </View>
            <Text style={styles.kpiValue}>{totalItems}</Text>
            <Text style={styles.kpiSub}>In Stock</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>CUSTOMERS</Text>
              <Feather name="users" size={16} color="#7c3aed" />
            </View>
            <Text style={styles.kpiValue}>{totalCustomers}</Text>
            <Text style={styles.kpiSub}>Registered</Text>
          </View>
        </View>

        {/* Live Data Sections */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>RECENT INVENTORY</Text>
              <TouchableOpacity onPress={() => onNavigate('products')}>
                <Text style={styles.seeAll}>Manage Stock</Text>
              </TouchableOpacity>
            </View>
            
            {products.length === 0 ? (
              <Text style={styles.emptyText}>No products found.</Text>
            ) : (
              products.map((p) => (
                <View key={p.id} style={styles.listItem}>
                  <View style={[styles.avatar, { backgroundColor: '#eff6ff' }]}>
                    <Feather name="box" size={18} color="#2563eb" />
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{p.name}</Text>
                    <Text style={styles.listSub}>Stock: {p.current_stock || 0} {p.unit || 'pcs'}</Text>
                  </View>
                  <Text style={styles.listBalance}>{formatCurrency(p.selling_price || 0)}</Text>
                </View>
              ))
            )}
          </View>
        )}
        
        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  shopName: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dateText: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  newSaleBtn: {
    marginBottom: 24,
    borderRadius: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  newSaleGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#2563eb',
  },
  newSaleBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  kpiCardFull: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 32,
  },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  kpiValueLarge: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -1,
  },
  kpiValue: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  kpiSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  listSection: {
    marginBottom: 28,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 16,
  },
  listItem: {
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
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSub: {
    color: '#64748b',
    fontSize: 13,
  },
  listBalance: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  }
});
