import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  ProductWithStock,
  CustomerWithBalance,
  SupplierWithBalance,
  Ledger,
  DayBookEntry,
  StockSummary,
} from '@agre/shared/types';

export const api = {
  // ============================================================
  // Companies
  // ============================================================
  
  async getCompanies() {
    if (!isSupabaseConfigured()) return [];
    // If not using RLS with user_roles perfectly yet, we can just fetch all companies for now
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.warn('Supabase fetch companies error:', error.message);
      return [];
    }
    return data || [];
  },

  async createCompany(payload: Partial<any>) {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
    
    // 1. Insert company
    const { data: comp, error: compError } = await supabase
      .from('companies')
      .insert([payload])
      .select()
      .single();
      
    if (compError) throw compError;
    
    // 2. Create financial year for this company
    const fyPayload = {
      company_id: comp.id,
      name: `FY ${new Date(comp.books_beginning_date).getFullYear()}-${new Date(comp.books_beginning_date).getFullYear() + 1}`,
      start_date: comp.books_beginning_date,
      end_date: `${new Date(comp.books_beginning_date).getFullYear() + 1}-03-31`,
    };
    
    await supabase.from('financial_years').insert([fyPayload]);
    
    return comp;
  },

  // Products
  async getProducts(companyId: string): Promise<ProductWithStock[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*, units(name, symbol), categories(name)')
      .order('name');
    if (error) {
      console.warn('Supabase fetch products error:', error.message);
      return [];
    }
    return (data || []).map((p: any) => ({
      ...p,
      unit_name: p.units?.name || 'Pcs',
      unit_symbol: p.units?.symbol || 'Pcs',
      category_name: p.categories?.name || 'General',
      current_stock: 0, // Computed from stock_movements
    }));
  },

  // Customers
  async getCustomers(companyId: string): Promise<CustomerWithBalance[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('name');
    if (error) {
      console.warn('Supabase fetch customers error:', error.message);
      return [];
    }
    return (data || []).map((c: any) => ({
      ...c,
      total_receivable: 0,
      total_received: 0,
      outstanding_balance: c.opening_balance || 0,
    }));
  },

  // Suppliers
  async getSuppliers(companyId: string): Promise<SupplierWithBalance[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    if (error) {
      console.warn('Supabase fetch suppliers error:', error.message);
      return [];
    }
    return (data || []).map((s: any) => ({
      ...s,
      total_payable: 0,
      total_paid: 0,
      outstanding_balance: s.opening_balance || 0,
    }));
  },

  // Ledgers
  async getLedgers(companyId: string): Promise<(Ledger & { group_name: string; balance: number })[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('ledgers')
      .select('*, ledger_groups(name)')
      .order('name');
    if (error) {
      console.warn('Supabase fetch ledgers error:', error.message);
      return [];
    }
    return (data || []).map((l: any) => ({
      ...l,
      group_name: l.ledger_groups?.name || '',
      balance: l.opening_balance || 0,
    }));
  },

  // Day Book
  async getDayBook(companyId: string, fromDate?: string, toDate?: string): Promise<DayBookEntry[]> {
    if (!isSupabaseConfigured()) return [];
    const query = supabase
      .from('vouchers')
      .select('*')
      .eq('company_id', companyId)
      .order('date', { ascending: false });
    
    if (fromDate) query.gte('date', fromDate);
    if (toDate) query.lte('date', toDate);

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase fetch daybook error:', error.message);
      return [];
    }
    return (data || []).map((v: any) => ({
      date: v.date,
      particular: v.party_name || 'Voucher Entry',
      voucher_type: v.voucher_type,
      voucher_number: v.voucher_number,
      voucher_id: v.id,
      debit: v.voucher_type === 'sale' || v.voucher_type === 'receipt' ? v.total_amount : 0,
      credit: v.voucher_type === 'purchase' || v.voucher_type === 'payment' || v.voucher_type === 'expense' ? v.total_amount : 0,
    }));
  },

  // Stock Summary
  async getStockSummary(companyId: string): Promise<StockSummary[]> {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase
      .from('products')
      .select('*, units(name), categories(name)')
      .order('name');
    if (error) return [];
    return (data || []).map((p: any) => ({
      product_id: p.id,
      product_name: p.name,
      product_sku: p.sku,
      category_name: p.categories?.name,
      unit_name: p.units?.name || 'Pcs',
      current_stock: 0,
      minimum_stock: p.minimum_stock || 0,
      cost_price: p.cost_price || 0,
      selling_price: p.selling_price || 0,
      stock_value: 0,
      is_below_minimum: false,
    }));
  },

  // ============================================================
  // Analytics RPCs
  // ============================================================

  async getAnalyticsMonthlyItems(companyId: string, year: number) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.rpc('get_analytics_monthly_items', {
      p_company_id: companyId,
      p_year: year,
    });
    if (error) {
      console.warn('Analytics monthly items error:', error.message);
      return [];
    }
    return data || [];
  },

  async getAnalyticsCategories(companyId: string, startDate: string, endDate: string) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.rpc('get_analytics_categories', {
      p_company_id: companyId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
    if (error) {
      console.warn('Analytics categories error:', error.message);
      return [];
    }
    return data || [];
  },

  async getAnalyticsGeography(companyId: string, startDate: string, endDate: string) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.rpc('get_analytics_geography', {
      p_company_id: companyId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
    if (error) {
      console.warn('Analytics geography error:', error.message);
      return [];
    }
    return data || [];
  },

  async getAnalyticsCustomers(companyId: string, startDate: string, endDate: string) {
    if (!isSupabaseConfigured()) return [];
    const { data, error } = await supabase.rpc('get_analytics_customers', {
      p_company_id: companyId,
      p_start_date: startDate,
      p_end_date: endDate,
    });
    if (error) {
      console.warn('Analytics customers error:', error.message);
      return [];
    }
    return data || [];
  },
};

