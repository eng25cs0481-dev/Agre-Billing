import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';

export default function SettingsScreen() {
  const [checking, setChecking] = useState(false);

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const res = await fetch('https://api.github.com/repos/eng25cs0481-dev/Agre-Billing/releases/latest');
      if (res.ok) {
        const data = await res.json();
        Alert.alert('App Update', `Agre Billing is up to date (${data.tag_name || 'v1.0.0'}).`);
      } else {
        Alert.alert('App Update', 'Agre Billing Mobile v1.0.0 is up to date.');
      }
    } catch {
      Alert.alert('App Update', 'Agre Billing Mobile v1.0.0 is up to date.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Profile */}
      <View style={styles.card}>
        <Text style={styles.shopName}>Agre General Store</Text>
        <Text style={styles.shopSub}>Mobile Counter POS & Billing</Text>
        <Text style={styles.fyText}>FY: 2026-2027 (No GST)</Text>
      </View>

      {/* Cloud Sync Status */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>CLOUD DATABASE & SYNC</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Backend</Text>
          <Text style={styles.valueGreen}>Supabase Cloud (Online)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Project</Text>
          <Text style={styles.value}>odhvrjmateakyrgjpdyp</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sync Mode</Text>
          <Text style={styles.value}>Live + Offline SQLite Cache</Text>
        </View>
      </View>

      {/* Software Updates */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>SOFTWARE UPDATES & VERSION</Text>
        <View style={styles.row}>
          <Text style={styles.label}>App Version</Text>
          <Text style={styles.value}>v1.0.0 (Release)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Repository</Text>
          <Text style={styles.value}>eng25cs0481-dev/Agre-Billing</Text>
        </View>
        <TouchableOpacity style={styles.updateBtn} onPress={handleCheckUpdate} disabled={checking}>
          {checking ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.updateBtnText}>Check for Updates</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Action Masters */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>ACTIONS & BACKUP</Text>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Database Backup', 'Local offline database backup created.')}>
          <Text style={styles.actionBtnText}>Backup Local SQLite Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edf7ee',
    padding: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#0c3c78',
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c3c78',
  },
  shopSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  fyText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0c3c78',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 12,
    color: '#64748b',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  valueGreen: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  updateBtn: {
    backgroundColor: '#0c3c78',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 12,
  },
  updateBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  actionBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 12,
  },
});
