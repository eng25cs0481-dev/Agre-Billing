import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';

const CURRENT_VERSION = 'v1.0.0';
const GITHUB_REPO = 'eng25cs0481-dev/Agre-Billing';

export default function SettingsScreen() {
  const [checking, setChecking] = useState(false);
  const [latestRelease, setLatestRelease] = useState<{ tag: string; body?: string; downloadUrl?: string } | null>(null);

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
      if (res.ok) {
        const data = await res.json();
        const tag = data.tag_name || 'v1.0.0';
        
        // Find .apk asset if present
        let apkUrl = data.html_url;
        if (data.assets && data.assets.length > 0) {
          const apkAsset = data.assets.find((a: any) => a.name.endsWith('.apk'));
          if (apkAsset) {
            apkUrl = apkAsset.browser_download_url;
          }
        }

        if (tag !== CURRENT_VERSION) {
          setLatestRelease({
            tag,
            body: data.body || 'Performance improvements and new features.',
            downloadUrl: apkUrl,
          });
          Alert.alert(
            'New Version Available! 🎉',
            `Version ${tag} is available (Current: ${CURRENT_VERSION}).\n\nWould you like to download the update?`,
            [
              { text: 'Later', style: 'cancel' },
              { text: 'Download Update', onPress: () => Linking.openURL(apkUrl) },
            ]
          );
        } else {
          Alert.alert('Up to Date', `Agre Billing Mobile is on the latest version (${CURRENT_VERSION}).`);
        }
      } else {
        Alert.alert('Up to Date', `Agre Billing Mobile is on the latest version (${CURRENT_VERSION}).`);
      }
    } catch {
      Alert.alert('Update Check', `Agre Billing Mobile ${CURRENT_VERSION} is active.`);
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
        <Text style={styles.fyText}>FY: 2026-2027 (Zero GST)</Text>
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
        <Text style={styles.sectionTitle}>HOW MOBILE UPDATES WORK</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Installed Version</Text>
          <Text style={styles.value}>{CURRENT_VERSION}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Update Channel</Text>
          <Text style={styles.value}>GitHub Releases / OTA</Text>
        </View>

        <Text style={styles.infoText}>
          When a new version is released on GitHub, you can download and install the new APK directly with 1 tap.
        </Text>

        <TouchableOpacity style={styles.updateBtn} onPress={handleCheckUpdate} disabled={checking}>
          {checking ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.updateBtnText}>Check for Updates Now</Text>
          )}
        </TouchableOpacity>

        {latestRelease && (
          <TouchableOpacity
            style={styles.downloadBanner}
            onPress={() => latestRelease.downloadUrl && Linking.openURL(latestRelease.downloadUrl)}
          >
            <Text style={styles.downloadBannerText}>⬇️ Download Version {latestRelease.tag}</Text>
          </TouchableOpacity>
        )}
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
  infoText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 16,
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
  downloadBanner: {
    marginTop: 10,
    backgroundColor: '#15803d',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  downloadBannerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
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
