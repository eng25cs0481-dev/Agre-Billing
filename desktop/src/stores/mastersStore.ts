import { create } from 'zustand';
import { useEffect } from 'react';
import type {
  CustomerWithBalance,
  SupplierWithBalance,
  ProductWithStock,
} from '@agre/shared/types';
import { api } from '../services/api';
import { useAppStore } from './appStore';

interface MastersState {
  customers: CustomerWithBalance[];
  suppliers: SupplierWithBalance[];
  products: ProductWithStock[];
  loading: boolean;
  loaded: boolean;
  /** Fetch all master lists once. Pass `force` to refetch (e.g. after a sync). */
  loadAll: (force?: boolean) => Promise<void>;
}

export const useMastersStore = create<MastersState>((set, get) => ({
  customers: [],
  suppliers: [],
  products: [],
  loading: false,
  loaded: false,

  loadAll: async (force = false) => {
    const { loading, loaded } = get();
    const companyId = useAppStore.getState().company?.id;
    if (!companyId) return;

    if (loading) return;
    if (loaded && !force) return;

    set({ loading: true });
    try {
      const [customers, suppliers, products] = await Promise.all([
        api.getCustomers(companyId),
        api.getSuppliers(companyId),
        api.getProducts(companyId),
      ]);
      set({ customers, suppliers, products, loaded: true, loading: false });
    } catch (err) {
      console.warn('Failed to load master data:', err);
      set({ loading: false });
    }
  },
}));

/**
 * Convenience hook: ensures the master lists are loaded and returns them.
 * Safe to call from any number of pages — the fetch only runs once.
 */
export function useMasters() {
  const state = useMastersStore();
  useEffect(() => {
    state.loadAll();
    // loadAll is a stable zustand action reference; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return state;
}
