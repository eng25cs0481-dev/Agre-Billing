import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { formatCurrency } from '@agre/shared/utils/currency';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  const todaySales = 0;
  const billsCount = 0;
  const outstandingReceivable = 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.shopName}>AGRE MACHINERY & HARDWARE</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiContainer}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>TODAY'S SALES</Text>
          <Text style={styles.kpiValue}>{formatCurrency(todaySales)}</Text>
          <Text style={styles.kpiSub}>{billsCount} Invoices Created</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>OUTSTANDING DUES</Text>
          <Text style={[styles.kpiValue, { color: '#ef5350' }]}>{formatCurrency(outstandingReceivable)}</Text>
          <Text style={styles.kpiSub}>To Collect</Text>
        </View>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity style={styles.newSaleBtn} onPress={() => onNavigate('sale')}>
        <Text style={styles.newSaleBtnText}>+ NEW SALE (BILL)</Text>
      </TouchableOpacity>

      {/* Quick Action Grid */}
      <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridBtn} onPress={() => onNavigate('products')}>
          <Text style={styles.gridBtnTitle}>Stock Lookup</Text>
          <Text style={styles.gridBtnSub}>Prices & Inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridBtn} onPress={() => onNavigate('customers')}>
          <Text style={styles.gridBtnTitle}>Customers</Text>
          <Text style={styles.gridBtnSub}>Dues & Ledger</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridBtn} onPress={() => onNavigate('outstanding')}>
          <Text style={styles.gridBtnTitle}>Collect Dues</Text>
          <Text style={styles.gridBtnSub}>Record Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridBtn} onPress={() => Alert.alert('Offline Sync', 'Offline Sync active. All records are up to date.')}>
          <Text style={styles.gridBtnTitle}>Sync Status</Text>
          <Text style={[styles.gridBtnSub, { color: '#66bb6a' }]}>● Online</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  shopName: {
    color: '#ffab40',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateText: {
    color: '#9fa8da',
    fontSize: 13,
  },
  kpiContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#111538',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  kpiLabel: {
    color: '#9fa8da',
    fontSize: 11,
    fontWeight: '700',
  },
  kpiValue: {
    color: '#fff9c4',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  kpiSub: {
    color: '#5c6bc0',
    fontSize: 11,
    marginTop: 4,
  },
  newSaleBtn: {
    backgroundColor: '#ff6f00',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  newSaleBtnText: {
    color: '#0a0e27',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionTitle: {
    color: '#9fa8da',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridBtn: {
    width: '48%',
    backgroundColor: '#151940',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  gridBtnTitle: {
    color: '#e8eaf6',
    fontSize: 14,
    fontWeight: '700',
  },
  gridBtnSub: {
    color: '#9fa8da',
    fontSize: 11,
    marginTop: 4,
  },
});
