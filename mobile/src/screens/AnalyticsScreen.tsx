import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '@agre/shared';
import { useAppStore } from '../stores/appStore';

interface AnalyticsProps {
  onBack: () => void;
  onMenuPress: () => void;
}

type Tab = 'overview' | 'items' | 'categories' | 'geography' | 'customers';

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];
const SCREEN_W = Dimensions.get('window').width;
const BAR_MAX_W = SCREEN_W - 180;

export const AnalyticsScreen: React.FC<AnalyticsProps> = ({ onBack, onMenuPress }) => {
  const insets = useSafeAreaInsets();
  const company = useAppStore(s => s.company);
  const currentYear = new Date().getFullYear();

  const [tab, setTab] = useState<Tab>('overview');
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);

  const [monthlyItems, setMonthlyItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [geography, setGeography] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const startDate = `${year}-04-01`;
  const endDate = `${year + 1}-03-31`;

  useEffect(() => {
    async function loadData() {
      if (!company) return;
      setLoading(true);
      try {
        const companyId = company.id;
        const [mi, cat, geo, cust] = await Promise.all([
          supabase.rpc('get_analytics_monthly_items', { p_company_id: companyId, p_year: year }),
          supabase.rpc('get_analytics_categories', { p_company_id: companyId, p_start_date: startDate, p_end_date: endDate }),
          supabase.rpc('get_analytics_geography', { p_company_id: companyId, p_start_date: startDate, p_end_date: endDate }),
          supabase.rpc('get_analytics_customers', { p_company_id: companyId, p_start_date: startDate, p_end_date: endDate }),
        ]);
        setMonthlyItems(mi.data || []);
        setCategories(cat.data || []);
        setGeography(geo.data || []);
        setCustomers(cust.data || []);
      } catch (err) {
        console.error('Mobile Analytics Load Error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [company, year, startDate, endDate]);

  // Aggregate monthly revenue
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  const monthMap = new Map<string, number>();
  monthlyItems.forEach((r: any) => {
    monthMap.set(r.month, (monthMap.get(r.month) || 0) + Number(r.total_revenue));
  });
  Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([month, revenue]) => monthlyRevenue.push({ month, revenue }));

  // Top products
  const productMap = new Map<string, { qty: number; revenue: number }>();
  monthlyItems.forEach((r: any) => {
    const prev = productMap.get(r.product_name) || { qty: 0, revenue: 0 };
    productMap.set(r.product_name, {
      qty: prev.qty + Number(r.total_quantity),
      revenue: prev.revenue + Number(r.total_revenue),
    });
  });
  const topProducts = Array.from(productMap.entries())
    .map(([name, val]) => ({ name, ...val }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const totalRevenue = monthlyRevenue.reduce((s, r) => s + r.revenue, 0);
  const totalInvoices = customers.reduce((s: number, c: any) => s + Number(c.invoice_count), 0);
  const avgOrderValue = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'bar-chart-2' },
    { key: 'items', label: 'Items', icon: 'package' },
    { key: 'categories', label: 'Category', icon: 'tag' },
    { key: 'geography', label: 'Region', icon: 'map-pin' },
    { key: 'customers', label: 'Customers', icon: 'users' },
  ];

  const maxRevenue = (arr: any[], key: string) => {
    const max = Math.max(...arr.map((r) => Number(r[key]) || 0), 1);
    return max;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress} style={styles.headerBtn}>
          <Feather name="menu" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity onPress={onBack} style={styles.headerBtn}>
          <Feather name="x" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Year Selector */}
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => setYear(year - 1)} style={styles.yearBtn}>
          <Feather name="chevron-left" size={18} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.yearText}>FY {year}–{year + 1}</Text>
        <TouchableOpacity onPress={() => setYear(Math.min(year + 1, currentYear))} style={styles.yearBtn}>
          <Feather name="chevron-right" size={18} color={year >= currentYear ? '#cbd5e1' : '#2563eb'} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar} contentContainerStyle={{ gap: 4, paddingHorizontal: 12 }}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
            onPress={() => setTab(t.key)}
          >
            <Feather name={t.icon as any} size={14} color={tab === t.key ? '#fff' : '#64748b'} />
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === 'overview' && (
              <View>
                <View style={styles.cardRow}>
                  <SummaryCard label="Revenue" value={`₹${formatCurrency(totalRevenue, '')}`} color="#2563eb" icon="trending-up" />
                  <SummaryCard label="Invoices" value={String(totalInvoices)} color="#10b981" icon="file-text" />
                </View>
                <View style={styles.cardRow}>
                  <SummaryCard label="Avg Order" value={`₹${formatCurrency(avgOrderValue, '')}`} color="#f59e0b" icon="zap" />
                  <SummaryCard label="Customers" value={String(customers.length)} color="#8b5cf6" icon="users" />
                </View>

                <Text style={styles.sectionTitle}>Monthly Revenue</Text>
                {monthlyRevenue.length > 0 ? (
                  <View style={styles.chartCard}>
                    {monthlyRevenue.map((r, i) => {
                      const max = maxRevenue(monthlyRevenue, 'revenue');
                      const w = (r.revenue / max) * BAR_MAX_W;
                      return (
                        <View key={r.month} style={styles.barRow}>
                          <Text style={styles.barLabel}>{r.month.substring(5)}</Text>
                          <View style={[styles.bar, { width: Math.max(w, 4), backgroundColor: COLORS[i % COLORS.length] }]} />
                          <Text style={styles.barValue}>₹{(r.revenue / 1000).toFixed(1)}k</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : <EmptyState />}

                <Text style={styles.sectionTitle}>Top 5 Products</Text>
                {topProducts.slice(0, 5).map((p, i) => (
                  <View key={p.name} style={styles.listItem}>
                    <Text style={[styles.rankBadge, { backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }]}>#{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listItemName}>{p.name}</Text>
                      <Text style={styles.listItemSub}>{p.qty} units sold</Text>
                    </View>
                    <Text style={styles.listItemValue}>₹{formatCurrency(p.revenue, '')}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* ITEMS */}
            {tab === 'items' && (
              <View>
                <Text style={styles.sectionTitle}>Top Products by Revenue</Text>
                {topProducts.length > 0 ? (
                  <View style={styles.chartCard}>
                    {topProducts.map((p, i) => {
                      const max = maxRevenue(topProducts, 'revenue');
                      const w = (p.revenue / max) * BAR_MAX_W;
                      return (
                        <View key={p.name} style={styles.barRow}>
                          <Text style={[styles.barLabel, { width: 80 }]} numberOfLines={1}>{p.name}</Text>
                          <View style={[styles.bar, { width: Math.max(w, 4), backgroundColor: COLORS[i % COLORS.length] }]} />
                          <Text style={styles.barValue}>₹{(p.revenue / 1000).toFixed(1)}k</Text>
                        </View>
                      );
                    })}
                  </View>
                ) : <EmptyState />}

                {topProducts.map((p, i) => (
                  <View key={p.name} style={styles.listItem}>
                    <Text style={[styles.rankBadge, { backgroundColor: COLORS[i % COLORS.length] + '20', color: COLORS[i % COLORS.length] }]}>#{i + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listItemName}>{p.name}</Text>
                      <Text style={styles.listItemSub}>{p.qty} units sold</Text>
                    </View>
                    <Text style={styles.listItemValue}>₹{formatCurrency(p.revenue, '')}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* CATEGORIES */}
            {tab === 'categories' && (
              <View>
                <Text style={styles.sectionTitle}>Category-wise Revenue</Text>
                {categories.length > 0 ? (
                  <>
                    <View style={styles.chartCard}>
                      {categories.map((c: any, i: number) => {
                        const max = maxRevenue(categories, 'total_revenue');
                        const w = (Number(c.total_revenue) / max) * BAR_MAX_W;
                        return (
                          <View key={c.category_name} style={styles.barRow}>
                            <Text style={[styles.barLabel, { width: 80 }]} numberOfLines={1}>{c.category_name}</Text>
                            <View style={[styles.bar, { width: Math.max(w, 4), backgroundColor: COLORS[i % COLORS.length] }]} />
                            <Text style={styles.barValue}>₹{(Number(c.total_revenue) / 1000).toFixed(1)}k</Text>
                          </View>
                        );
                      })}
                    </View>
                    {categories.map((c: any, i: number) => (
                      <View key={c.category_name} style={styles.listItem}>
                        <View style={[styles.colorDot, { backgroundColor: COLORS[i % COLORS.length] }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listItemName}>{c.category_name}</Text>
                          <Text style={styles.listItemSub}>{Number(c.total_quantity)} units</Text>
                        </View>
                        <Text style={styles.listItemValue}>₹{formatCurrency(Number(c.total_revenue), '')}</Text>
                      </View>
                    ))}
                  </>
                ) : <EmptyState />}
              </View>
            )}

            {/* GEOGRAPHY */}
            {tab === 'geography' && (
              <View>
                <Text style={styles.sectionTitle}>Sales by Region</Text>
                {geography.length > 0 ? (
                  <>
                    <View style={styles.chartCard}>
                      {geography.slice(0, 10).map((g: any, i: number) => {
                        const max = maxRevenue(geography, 'total_revenue');
                        const w = (Number(g.total_revenue) / max) * BAR_MAX_W;
                        return (
                          <View key={`${g.state}-${g.district}-${g.city}`} style={styles.barRow}>
                            <Text style={[styles.barLabel, { width: 70 }]} numberOfLines={1}>{g.city}</Text>
                            <View style={[styles.bar, { width: Math.max(w, 4), backgroundColor: COLORS[i % COLORS.length] }]} />
                            <Text style={styles.barValue}>₹{(Number(g.total_revenue) / 1000).toFixed(1)}k</Text>
                          </View>
                        );
                      })}
                    </View>
                    {geography.map((g: any, i: number) => (
                      <View key={`${g.state}-${g.district}-${g.city}-${i}`} style={styles.listItem}>
                        <Feather name="map-pin" size={16} color={COLORS[i % COLORS.length]} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.listItemName}>{g.city}, {g.district}</Text>
                          <Text style={styles.listItemSub}>{g.state} • {Number(g.invoice_count)} invoices</Text>
                        </View>
                        <Text style={styles.listItemValue}>₹{formatCurrency(Number(g.total_revenue), '')}</Text>
                      </View>
                    ))}
                  </>
                ) : <EmptyState />}
              </View>
            )}

            {/* CUSTOMERS */}
            {tab === 'customers' && (
              <View>
                <Text style={styles.sectionTitle}>Top Customers</Text>
                {customers.length > 0 ? (
                  <>
                    <View style={styles.chartCard}>
                      {customers.slice(0, 10).map((c: any, i: number) => {
                        const max = maxRevenue(customers, 'total_revenue');
                        const w = (Number(c.total_revenue) / max) * BAR_MAX_W;
                        return (
                          <View key={c.customer_name} style={styles.barRow}>
                            <Text style={[styles.barLabel, { width: 80 }]} numberOfLines={1}>{c.customer_name}</Text>
                            <View style={[styles.bar, { width: Math.max(w, 4), backgroundColor: COLORS[i % COLORS.length] }]} />
                            <Text style={styles.barValue}>₹{(Number(c.total_revenue) / 1000).toFixed(1)}k</Text>
                          </View>
                        );
                      })}
                    </View>
                    {customers.map((c: any, i: number) => {
                      const avg = Number(c.invoice_count) > 0 ? Number(c.total_revenue) / Number(c.invoice_count) : 0;
                      const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`;
                      return (
                        <View key={c.customer_name} style={styles.listItem}>
                          <Text style={styles.medalText}>{medal}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.listItemName}>{c.customer_name}</Text>
                            <Text style={styles.listItemSub}>{Number(c.invoice_count)} invoices • Avg ₹{formatCurrency(avg, '')}</Text>
                          </View>
                          <Text style={styles.listItemValue}>₹{formatCurrency(Number(c.total_revenue), '')}</Text>
                        </View>
                      );
                    })}
                  </>
                ) : <EmptyState />}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

function SummaryCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <View style={[cardStyles.card, { borderLeftColor: color }]}>
      <View style={[cardStyles.iconCircle, { backgroundColor: color + '15' }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={cardStyles.label}>{label}</Text>
      <Text style={[cardStyles.value, { color }]}>{value}</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <Feather name="inbox" size={32} color="#cbd5e1" />
      <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>No data for this period</Text>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  label: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 18, fontWeight: '900', marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  headerBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '800', color: '#0f172a' },
  yearRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, backgroundColor: '#fff', gap: 16,
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0',
  },
  yearBtn: { padding: 6, backgroundColor: '#eff6ff', borderRadius: 20 },
  yearText: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  tabBar: { backgroundColor: '#fff', paddingVertical: 8, maxHeight: 50, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  tabBtnActive: { backgroundColor: '#2563eb' },
  tabLabel: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tabLabelActive: { color: '#fff' },
  content: { flex: 1, padding: 14 },
  cardRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: '#0f172a',
    marginTop: 18, marginBottom: 10,
  },
  chartCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 },
  barLabel: { width: 40, fontSize: 10, color: '#64748b', fontWeight: '600', textAlign: 'right' },
  bar: { height: 16, borderRadius: 4 },
  barValue: { fontSize: 10, color: '#475569', fontWeight: '700' },
  listItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 14, borderRadius: 10,
    marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1,
  },
  rankBadge: {
    fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginRight: 12, overflow: 'hidden',
  },
  colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  medalText: { fontSize: 16, marginRight: 12 },
  listItemName: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
  listItemSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  listItemValue: { fontSize: 14, fontWeight: '800', color: '#0f172a' },
});
