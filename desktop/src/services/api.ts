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
  // Products
  async getProducts(): Promise<ProductWithStock[]> {
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
  async getCustomers(): Promise<CustomerWithBalance[]> {
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
  async getSuppliers(): Promise<SupplierWithBalance[]> {
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
  async getLedgers(): Promise<(Ledger & { group_name: string; balance: number })[]> {
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
  async getDayBook(fromDate?: string, toDate?: string): Promise<DayBookEntry[]> {
    if (!isSupabaseConfigured()) return [];
    const query = supabase
      .from('vouchers')
      .select('*')
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
  async getStockSummary(): Promise<StockSummary[]> {
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
};
