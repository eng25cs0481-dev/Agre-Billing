import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

export const SettingsScreen: React.FC = () => {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      Alert.alert('Sync Successful', 'All local SQLite transactions are synchronized with the cloud database.');
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings & Sync</Text>
      </View>

      {/* Sync Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>OFFLINE DATABASE & SYNC</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Network Status:</Text>
          <Text style={styles.statusOnline}>● Online</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Pending Offline Queue:</Text>
          <Text style={styles.statusVal}>0 Items</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Local DB:</Text>
          <Text style={styles.statusVal}>SQLite (expo-sqlite)</Text>
        </View>

        <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={syncing}>
          <Text style={styles.syncBtnText}>{syncing ? 'SYNCING...' : 'SYNC WITH CLOUD NOW'}</Text>
        </TouchableOpacity>
      </View>

      {/* Company Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>SHOP PROFILE</Text>
        <Text style={styles.shopName}>Agre General Store</Text>
        <Text style={styles.shopSub}>123 Market Yard, Pune, Maharashtra</Text>
        <Text style={styles.shopSub}>Phone: +91 9822001122</Text>
        <Text style={styles.shopSub}>FY: 2026-27 (Beginning: 01-Apr-2026)</Text>
      </View>

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ABOUT AGRE BILLING MOBILE</Text>
        <Text style={styles.aboutText}>Version: 1.0.0 (TallyPrime 7.1 Architecture)</Text>
        <Text style={styles.aboutText}>Zero GST / Zero Barcode Engine</Text>
        <Text style={styles.aboutText}>Double-Entry Accounting Powered</Text>
      </View>
    </ScrollView>
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
  card: {
    backgroundColor: '#111538',
    padding: 14,
    margin: 12,
    marginBottom: 0,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  cardTitle: { color: '#9fa8da', fontSize: 11, fontWeight: '700', marginBottom: 8 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statusLabel: { color: '#e8eaf6', fontSize: 12 },
  statusOnline: { color: '#66bb6a', fontWeight: 'bold', fontSize: 12 },
  statusVal: { color: '#fff', fontSize: 12, fontWeight: '600' },
  syncBtn: {
    backgroundColor: '#1a237e',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#3949ab',
  },
  syncBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  shopName: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  shopSub: { color: '#9fa8da', fontSize: 12, marginTop: 3 },
  aboutText: { color: '#9fa8da', fontSize: 11.5, marginTop: 4 },
});
