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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // Placeholder metrics
  const todaySales = 0;
  const billsCount = 0;

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch total items count
        const { count: itemsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });
        
        // Fetch total customers count
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true });

        // Fetch top products for snapshot
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
  }, []);

  return (
    <LinearGradient
      colors={['#060B1F', '#0A0F2C', '#10173A']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>AGRE MACHINERY</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileBtn}>
            <Feather name="user" size={20} color="#ffab40" />
          </TouchableOpacity>
        </View>

        {/* Primary Action Button */}
        <TouchableOpacity style={styles.newSaleBtn} onPress={() => onNavigate('sale')}>
          <LinearGradient
            colors={['#FF8F00', '#EF6C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.newSaleGradient}
          >
            <Feather name="plus-circle" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.newSaleBtnText}>NEW SALE (BILL)</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* KPI Row 1: Today's Sales */}
        <LinearGradient colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']} style={styles.kpiCardFull}>
          <View style={styles.kpiHeader}>
            <Text style={styles.kpiLabel}>TODAY'S SALES</Text>
            <Feather name="trending-up" size={14} color="#66bb6a" />
          </View>
          <Text style={styles.kpiValueLarge}>{formatCurrency(todaySales)}</Text>
          <Text style={styles.kpiSub}>{billsCount} Invoices Created</Text>
        </LinearGradient>

        {/* KPI Row 2: Items & Customers */}
        <View style={styles.kpiContainer}>
          <LinearGradient colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>TOTAL ITEMS</Text>
              <Feather name="package" size={14} color="#42a5f5" />
            </View>
            <Text style={styles.kpiValue}>{totalItems}</Text>
            <Text style={styles.kpiSub}>In Stock</Text>
          </LinearGradient>

          <LinearGradient colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']} style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>CUSTOMERS</Text>
              <Feather name="users" size={14} color="#ab47bc" />
            </View>
            <Text style={styles.kpiValue}>{totalCustomers}</Text>
            <Text style={styles.kpiSub}>Registered</Text>
          </LinearGradient>
        </View>

        {/* Live Data Sections */}
        {loading ? (
          <ActivityIndicator size="large" color="#ffab40" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>INVENTORY SNAPSHOT</Text>
              <TouchableOpacity onPress={() => onNavigate('products')}>
                <Text style={styles.seeAll}>Manage Stock</Text>
              </TouchableOpacity>
            </View>
            
            {products.length === 0 ? (
              <Text style={styles.emptyText}>No products found.</Text>
            ) : (
              products.map((p) => (
                <View key={p.id} style={styles.listItem}>
                  <View style={[styles.avatar, { backgroundColor: 'rgba(255,171,64,0.1)' }]}>
                    <Feather name="box" size={16} color="#ffab40" />
                  </View>
                  <View style={styles.listInfo}>
                    <Text style={styles.listName}>{p.name}</Text>
                    <Text style={styles.listSub}>Stock: {p.current_stock || 0} {p.unit || 'pcs'}</Text>
                  </View>
                  <Text style={styles.listBalance}>{formatCurrency(p.sale_price || 0)}</Text>
                </View>
              ))
            )}
          </View>
        )}
        
        {/* Bottom spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  shopName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    color: '#9fa8da',
    fontSize: 13,
    marginTop: 4,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  newSaleBtn: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#ef6c00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  newSaleGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  newSaleBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  kpiCardFull: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiLabel: {
    color: '#9fa8da',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  kpiValueLarge: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  kpiValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  kpiSub: {
    color: '#7986cb',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#7986cb',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
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
    color: '#ffab40',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(159, 168, 218, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  listSub: {
    color: '#9fa8da',
    fontSize: 12,
  },
  listBalance: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyText: {
    color: '#7986cb',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  }
});
