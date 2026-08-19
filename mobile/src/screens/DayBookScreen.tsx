import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { formatCurrency } from '@agre/shared/utils/currency';

interface DayBookItem {
  id: string;
  time: string;
  party: string;
  type: string;
  invNo: string;
  amount: number;
  mode: string;
}

const TODAY_TRANSACTIONS: DayBookItem[] = [];

export const DayBookScreen: React.FC = () => {
  const totalSales = TODAY_TRANSACTIONS
    .filter((t) => t.type === 'Sale')
    .reduce((s, t) => s + t.amount, 0);

  const totalReceipts = TODAY_TRANSACTIONS
    .filter((t) => t.type === 'Receipt')
    .reduce((s, t) => s + t.amount, 0);

  const handleShare = (item: DayBookItem) => {
    Alert.alert(
      'Share Receipt',
      `Invoice: ${item.invNo}\nCustomer: ${item.party}\nAmount: ${formatCurrency(item.amount)}\n\nSharing receipt text/PDF via WhatsApp/ShareSheet.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Day Book (Today's Transactions)</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL SALES TODAY</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSales)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>RECEIPTS COLLECTED</Text>
          <Text style={[styles.summaryValue, { color: '#66bb6a' }]}>{formatCurrency(totalReceipts)}</Text>
        </View>
      </View>

      <ScrollView style={styles.list}>
        {TODAY_TRANSACTIONS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => handleShare(item)}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.partyName}>{item.party}</Text>
                <View style={[styles.badge, item.type === 'Sale' ? styles.badgeSale : styles.badgeReceipt]}>
                  <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.meta}>{item.invNo} • {item.time} • {item.mode}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
              <Text style={styles.shareText}>Tap to Share ↗</Text>
            </View>
          </TouchableOpacity>
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
  summaryRow: { flexDirection: 'row', gap: 10, padding: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#111538',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  summaryLabel: { color: '#9fa8da', fontSize: 9.5, fontWeight: '700' },
  summaryValue: { color: '#fff9c4', fontSize: 16, fontWeight: '800', marginTop: 2 },
  list: { flex: 1, paddingHorizontal: 12 },
  card: {
    backgroundColor: '#111538',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyName: { color: '#e8eaf6', fontSize: 13.5, fontWeight: '700' },
  badge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  badgeSale: { backgroundColor: 'rgba(255, 171, 64, 0.2)' },
  badgeReceipt: { backgroundColor: 'rgba(102, 187, 106, 0.2)' },
  badgeText: { color: '#ffab40', fontSize: 9.5, fontWeight: 'bold' },
  meta: { color: '#5c6bc0', fontSize: 11, marginTop: 3 },
  amount: { color: '#fff9c4', fontSize: 15, fontWeight: '800' },
  shareText: { color: '#42a5f5', fontSize: 10, marginTop: 3, fontWeight: '600' },
});
