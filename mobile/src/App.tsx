import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Modal, Animated } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { DashboardScreen } from './screens/DashboardScreen';
import { QuickSaleScreen } from './screens/QuickSaleScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from './stores/appStore';
import { supabase } from './lib/supabase';
import type { Company } from '@agre/shared/types';

type TabType = 'dashboard' | 'sale' | 'products' | 'analytics';
type VoucherType = 'retail' | 'wholesale' | 'purchase' | null;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [voucherType, setVoucherType] = useState<VoucherType>(null);
  
  // Modals
  const [isVoucherModalVisible, setVoucherModalVisible] = useState(false);
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [isCompanyModalVisible, setCompanyModalVisible] = useState(false);

  // App State
  const company = useAppStore(s => s.company);
  const setCompany = useAppStore(s => s.setCompany);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    supabase.from('companies').select('*').then(({ data }) => {
      if (data) {
        setCompanies(data);
        if (data.length > 0 && !company) {
          // By default, if no company is selected, show modal
          setCompanyModalVisible(true);
        }
      }
    });
  }, [company]);

  const handleSaleClick = () => {
    setVoucherModalVisible(true);
  };

  const handleSelectVoucher = (type: VoucherType) => {
    setVoucherType(type);
    setVoucherModalVisible(false);
    setSidebarVisible(false); // close sidebar if open
    setActiveTab('sale');
  };

  const handleNavigate = (s: string) => {
    if (s === 'sale') {
      handleSaleClick();
    } else {
      setActiveTab(s as TabType);
      setSidebarVisible(false); // close sidebar on nav
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.container}>
          
          {/* Active Screen */}
          <View style={styles.content}>
            {activeTab === 'dashboard' && (
              <DashboardScreen onNavigate={handleNavigate} onMenuPress={() => setSidebarVisible(true)} />
            )}
            {activeTab === 'sale' && (
              <QuickSaleScreen voucherType={voucherType} onBack={() => setActiveTab('dashboard')} />
            )}
            {activeTab === 'products' && (
              <ProductsScreen onMenuPress={() => setSidebarVisible(true)} />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsScreen onBack={() => setActiveTab('dashboard')} onMenuPress={() => setSidebarVisible(true)} />
            )}
          </View>

          {/* Bottom Navigation Tab Bar (Clean Enterprise Light Theme) */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setActiveTab('dashboard')}
            >
              <Feather name="home" size={22} color={activeTab === 'dashboard' ? '#2563eb' : '#64748b'} />
              <Text style={[styles.tabLabel, activeTab === 'dashboard' && styles.tabLabelActive]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={handleSaleClick}
              activeOpacity={0.8}
            >
              <View style={{ position: 'absolute', top: -22 }}>
                <View style={styles.fab}>
                  <Feather name="plus" size={26} color="#ffffff" />
                </View>
              </View>
              <View style={{ width: 22, height: 22 }} />
              <Text style={[styles.tabLabel, { color: '#2563eb', fontWeight: '700' }]}>Sale</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabBtn}
              onPress={() => setActiveTab('products')}
            >
              <Feather name="package" size={22} color={activeTab === 'products' ? '#2563eb' : '#64748b'} />
              <Text style={[styles.tabLabel, activeTab === 'products' && styles.tabLabelActive]}>Stock</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sidebar Drawer (Sliding from left) */}
        <Modal visible={isSidebarVisible} transparent={true} animationType="fade">
          <View style={styles.sidebarOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setSidebarVisible(false)} />
            <View style={styles.sidebarContainer}>
              <View style={styles.sidebarHeader}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>{company?.name?.[0] || 'A'}</Text>
                </View>
                <View>
                  <Text style={styles.sidebarTitle}>{company?.name || 'Agre Billing'}</Text>
                  <Text style={styles.sidebarSub}>Admin Profile</Text>
                </View>
              </View>
              
              <View style={styles.sidebarMenu}>
                <TouchableOpacity style={[styles.sidebarMenuItem, activeTab === 'dashboard' && styles.sidebarMenuItemActive]} onPress={() => handleNavigate('dashboard')}>
                  <Feather name="home" size={20} color={activeTab === 'dashboard' ? '#2563eb' : '#475569'} />
                  <Text style={[styles.sidebarMenuText, activeTab === 'dashboard' && styles.sidebarMenuTextActive]}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.sidebarMenuItem, activeTab === 'sale' && styles.sidebarMenuItemActive]} onPress={handleSaleClick}>
                  <Feather name="shopping-cart" size={20} color={activeTab === 'sale' ? '#2563eb' : '#475569'} />
                  <Text style={[styles.sidebarMenuText, activeTab === 'sale' && styles.sidebarMenuTextActive]}>New Sale</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.sidebarMenuItem, activeTab === 'products' && styles.sidebarMenuItemActive]} onPress={() => handleNavigate('products')}>
                  <Feather name="package" size={20} color={activeTab === 'products' ? '#2563eb' : '#475569'} />
                  <Text style={[styles.sidebarMenuText, activeTab === 'products' && styles.sidebarMenuTextActive]}>Inventory & Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.sidebarMenuItem, activeTab === 'analytics' && styles.sidebarMenuItemActive]} onPress={() => handleNavigate('analytics')}>
                  <Feather name="bar-chart-2" size={20} color={activeTab === 'analytics' ? '#2563eb' : '#475569'} />
                  <Text style={[styles.sidebarMenuText, activeTab === 'analytics' && styles.sidebarMenuTextActive]}>Analytics</Text>
                </TouchableOpacity>

                <View style={styles.sidebarDivider} />

                <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => { setSidebarVisible(false); setCompanyModalVisible(true); }}>
                  <Feather name="briefcase" size={20} color="#475569" />
                  <Text style={styles.sidebarMenuText}>Change Company</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => {}}>
                  <Feather name="settings" size={20} color="#475569" />
                  <Text style={styles.sidebarMenuText}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarMenuItem} onPress={() => {}}>
                  <Feather name="log-out" size={20} color="#ef4444" />
                  <Text style={[styles.sidebarMenuText, { color: '#ef4444' }]}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Voucher Selection Modal */}
        <Modal visible={isVoucherModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setVoucherModalVisible(false)} />
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Voucher Type</Text>
              <Text style={styles.modalSub}>What type of entry do you want to create?</Text>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectVoucher('retail')}>
                <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                  <Feather name="shopping-bag" size={20} color="#2563eb" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionTitle}>Retail Sale</Text>
                  <Text style={styles.modalOptionSub}>Standard customer billing</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectVoucher('wholesale')}>
                <View style={[styles.iconBox, { backgroundColor: '#f5f3ff' }]}>
                  <Feather name="truck" size={20} color="#7c3aed" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionTitle}>Wholesale Sale</Text>
                  <Text style={styles.modalOptionSub}>Bulk orders and B2B</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectVoucher('purchase')}>
                <View style={[styles.iconBox, { backgroundColor: '#f0fdf4' }]}>
                  <Feather name="download" size={20} color="#16a34a" />
                </View>
                <View style={styles.modalOptionTextContainer}>
                  <Text style={styles.modalOptionTitle}>Purchase Entry</Text>
                  <Text style={styles.modalOptionSub}>Record incoming stock</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Company Selection Modal */}
        <Modal visible={isCompanyModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Select Company</Text>
              <Text style={styles.modalSub}>Choose a company to view and manage its data</Text>

              {companies.map((c) => (
                <TouchableOpacity 
                  key={c.id} 
                  style={[styles.modalOption, company?.id === c.id && { borderColor: '#2563eb', backgroundColor: '#eff6ff' }]} 
                  onPress={() => {
                    setCompany(c);
                    setCompanyModalVisible(false);
                  }}
                >
                  <View style={[styles.iconBox, { backgroundColor: company?.id === c.id ? '#3b82f6' : '#f1f5f9' }]}>
                    <Feather name="briefcase" size={20} color={company?.id === c.id ? '#ffffff' : '#64748b'} />
                  </View>
                  <View style={styles.modalOptionTextContainer}>
                    <Text style={[styles.modalOptionTitle, company?.id === c.id && { color: '#1e40af' }]}>{c.name}</Text>
                    <Text style={styles.modalOptionSub}>{c.city || 'Unknown City'} - {c.state || 'Unknown State'}</Text>
                  </View>
                  {company?.id === c.id ? (
                    <Feather name="check-circle" size={20} color="#2563eb" />
                  ) : (
                    <Feather name="chevron-right" size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              ))}
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
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  tabBtnCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: -20,
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#2563eb',
    fontWeight: '700',
  },

  // Sidebar styles
  sidebarOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    flexDirection: 'row',
  },
  sidebarContainer: {
    width: '75%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  sidebarHeader: {
    backgroundColor: '#f8fafc',
    padding: 24,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sidebarSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  sidebarMenu: {
    padding: 16,
    paddingTop: 24,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarMenuItemActive: {
    backgroundColor: '#eff6ff',
  },
  sidebarMenuText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 16,
  },
  sidebarMenuTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
    marginHorizontal: 8,
  },

  // Modal styles (Voucher Selection)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: -8,
  },
  modalTitle: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSub: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  modalOptionSub: {
    color: '#64748b',
    fontSize: 13,
  },
});
