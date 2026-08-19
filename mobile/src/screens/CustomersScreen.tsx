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

interface CustomerItem {
  id: string;
  name: string;
  code: string;
  phone: string;
  city: string;
  outstanding: number;
}

const DEMO_CUSTOMERS: CustomerItem[] = [];

export const CustomersScreen: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = DEMO_CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const totalOutstanding = DEMO_CUSTOMERS.reduce((s, c) => s + c.outstanding, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Customers & Dues ({filtered.length})</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>TOTAL CUSTOMER DUES (RECEIVABLES)</Text>
        <Text style={styles.summaryValue}>{formatCurrency(totalOutstanding)}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name, phone, city..."
          placeholderTextColor="#5c6bc0"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      <ScrollView style={styles.list}>
        {filtered.map((item) => (
          <View key={item.id} style={styles.customerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{item.name}</Text>
              <Text style={styles.customerDetails}>{item.phone} • {item.city} ({item.code})</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.dueLabel}>DUE BALANCE</Text>
              <Text style={[styles.dueAmount, item.outstanding > 0 ? styles.duePositive : styles.dueZero]}>
                {formatCurrency(item.outstanding)}
              </Text>
            </View>
          </View>
        ))}
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
  summaryBox: {
    backgroundColor: '#111538',
    padding: 12,
    margin: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  summaryLabel: { color: '#9fa8da', fontSize: 10, fontWeight: '700' },
  summaryValue: { color: '#ef5350', fontSize: 18, fontWeight: '800', marginTop: 2 },
  searchSection: { paddingHorizontal: 12, marginBottom: 8 },
  searchInput: {
    backgroundColor: '#0d1133',
    color: '#fff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    fontSize: 13,
  },
  list: { flex: 1, paddingHorizontal: 12 },
  customerCard: {
    backgroundColor: '#111538',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: { color: '#e8eaf6', fontSize: 13.5, fontWeight: '700' },
  customerDetails: { color: '#5c6bc0', fontSize: 11, marginTop: 2 },
  dueLabel: { color: '#9fa8da', fontSize: 9.5, fontWeight: '700' },
  dueAmount: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  duePositive: { color: '#ef5350' },
  dueZero: { color: '#66bb6a' },
});
