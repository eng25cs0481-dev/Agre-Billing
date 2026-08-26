import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Modal, Pressable } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DashboardScreen } from './screens/DashboardScreen';
import { QuickSaleScreen } from './screens/QuickSaleScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { Feather } from '@expo/vector-icons';

type TabType = 'dashboard' | 'sale' | 'products';
type VoucherType = 'retail' | 'wholesale' | 'purchase' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [voucherType, setVoucherType] = useState<VoucherType>(null);
  const [isVoucherModalVisible, setVoucherModalVisible] = useState(false);

  const handleSaleClick = () => {
    setVoucherModalVisible(true);
  };

  const handleSelectVoucher = (type: VoucherType) => {
    setVoucherType(type);
    setVoucherModalVisible(false);
    setActiveTab('sale');
  };

  const handleNavigate = (s: string) => {
    if (s === 'sale') {
      handleSaleClick();
    } else {
      setActiveTab(s as TabType);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0e27" />
        <View style={styles.container}>
          {/* Active Screen */}
          <View style={styles.content}>
            {activeTab === 'dashboard' && (
              <DashboardScreen onNavigate={handleNavigate} />
            )}
            {activeTab === 'sale' && (
              <QuickSaleScreen voucherType={voucherType} onBack={() => setActiveTab('dashboard')} />
            )}
            {activeTab === 'products' && <ProductsScreen />}
          </View>

          {/* Bottom Navigation Tab Bar */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'dashboard' && styles.tabBtnActive]}
              onPress={() => setActiveTab('dashboard')}
            >
              <Feather name="home" size={20} color={activeTab === 'dashboard' ? '#fff' : '#9fa8da'} style={{marginBottom: 4}} />
              <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'sale' && styles.tabBtnActive, { backgroundColor: '#ff6f00' }]}
              onPress={handleSaleClick}
            >
              <Feather name="plus-circle" size={20} color="#ffffff" style={{marginBottom: 4}} />
              <Text style={[styles.tabLabel, { color: '#ffffff', fontWeight: '900' }]}>SALE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
              onPress={() => setActiveTab('products')}
            >
              <Feather name="package" size={20} color={activeTab === 'products' ? '#fff' : '#9fa8da'} style={{marginBottom: 4}} />
              <Text style={[styles.tabLabel, activeTab === 'products' && styles.tabLabelActive]}>Stock</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Voucher Selection Modal */}
        <Modal visible={isVoucherModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Voucher Type</Text>
              <Text style={styles.modalSub}>What type of entry do you want to create?</Text>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectVoucher('retail')}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(66, 165, 245, 0.15)' }]}>
                  <Feather name="shopping-bag" size={20} color="#42a5f5" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionTitle}>Retail Sale</Text>
                  <Text style={styles.modalOptionSub}>Standard customer billing</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#5c6bc0" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectVoucher('wholesale')}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(171, 71, 188, 0.15)' }]}>
                  <Feather name="truck" size={20} color="#ab47bc" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionTitle}>Wholesale Sale</Text>
                  <Text style={styles.modalOptionSub}>Bulk orders and B2B</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#5c6bc0" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectVoucher('purchase')}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(102, 187, 106, 0.15)' }]}>
                  <Feather name="download" size={20} color="#66bb6a" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionTitle}>Purchase Entry</Text>
                  <Text style={styles.modalOptionSub}>Record incoming stock</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#5c6bc0" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalClose} onPress={() => setVoucherModalVisible(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </SafeAreaView>
    </SafeAreaProvider>
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
    height: 64,
    backgroundColor: '#0d1038',
    borderTopWidth: 1,
    borderTopColor: '#1e2358',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabBtn: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabBtnActive: {
    backgroundColor: '#1a237e',
  },
  tabLabel: {
    color: '#9fa8da',
    fontSize: 10,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: '#fff',
    fontWeight: '800',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 11, 31, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#111538',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e2358',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSub: {
    color: '#9fa8da',
    fontSize: 13,
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalOptionSub: {
    color: '#9fa8da',
    fontSize: 12,
  },
  modalClose: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#ef5350',
    fontSize: 15,
    fontWeight: '700',
  },
});
