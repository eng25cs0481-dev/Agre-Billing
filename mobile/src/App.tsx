import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { DashboardScreen } from './screens/DashboardScreen';
import { QuickSaleScreen } from './screens/QuickSaleScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { ReceiptScreen } from './screens/ReceiptScreen';
import { DayBookScreen } from './screens/DayBookScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type TabType = 'dashboard' | 'sale' | 'products' | 'customers' | 'receipt' | 'daybook' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e27" />
      <View style={styles.container}>
        {/* Active Screen */}
        <View style={styles.content}>
          {activeTab === 'dashboard' && (
            <DashboardScreen onNavigate={(s: any) => setActiveTab(s as TabType)} />
          )}
          {activeTab === 'sale' && (
            <QuickSaleScreen onBack={() => setActiveTab('dashboard')} />
          )}
          {activeTab === 'products' && <ProductsScreen />}
          {activeTab === 'customers' && <CustomersScreen />}
          {activeTab === 'receipt' && <ReceiptScreen />}
          {activeTab === 'daybook' && <DayBookScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </View>

        {/* Bottom Navigation Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'dashboard' && styles.tabBtnActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'sale' && styles.tabBtnActive, { backgroundColor: '#ff6f00' }]}
            onPress={() => setActiveTab('sale')}
          >
            <Text style={[styles.tabLabel, { color: '#0a0e27', fontWeight: '900' }]}>+ SALE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabLabel, activeTab === 'products' && styles.tabLabelActive]}>Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'customers' && styles.tabBtnActive]}
            onPress={() => setActiveTab('customers')}
          >
            <Text style={[styles.tabLabel, activeTab === 'customers' && styles.tabLabelActive]}>Dues</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'daybook' && styles.tabBtnActive]}
            onPress={() => setActiveTab('daybook')}
          >
            <Text style={[styles.tabLabel, activeTab === 'daybook' && styles.tabLabelActive]}>DayBook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'receipt' && styles.tabBtnActive]}
            onPress={() => setActiveTab('receipt')}
          >
            <Text style={[styles.tabLabel, activeTab === 'receipt' && styles.tabLabelActive]}>Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'settings' && styles.tabBtnActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabLabelActive]}>Sync</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 52,
    backgroundColor: '#0d1038',
    borderTopWidth: 1,
    borderTopColor: '#1e2358',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabBtn: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginHorizontal: 2,
  },
  tabBtnActive: {
    backgroundColor: '#1a237e',
  },
  tabLabel: {
    color: '#9fa8da',
    fontSize: 10.5,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: '800',
  },
});
