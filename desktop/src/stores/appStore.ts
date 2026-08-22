import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, FinancialYear } from '@agre/shared/types';

interface AppState {
  // Company
  company: Company;
  financialYear: FinancialYear | null;

  // Navigation
  currentDate: string; // YYYY-MM-DD
  sidebarCollapsed: boolean;

  // Actions
  setCompany: (company: Company) => void;
  setFinancialYear: (fy: FinancialYear | null) => void;
  setCurrentDate: (date: string) => void;
  toggleSidebar: () => void;
}

const DEFAULT_COMPANY: Company = {
  id: 'main-company',
  name: 'Agre Machinery And Hardware Stores',
  address: 'Main Market Road',
  city: 'Pune',
  state: 'Maharashtra',
  phone: '9822001122',
  email: 'contact@agre.local',
  currency_code: 'INR',
  currency_symbol: '₹',
  decimal_places: 2,
  books_beginning_date: '2026-04-01',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      company: DEFAULT_COMPANY,
      financialYear: null,
      currentDate: new Date().toISOString().split('T')[0],
      sidebarCollapsed: false,

      setCompany: (company) => set({ company }),
      setFinancialYear: (financialYear) => set({ financialYear }),
      setCurrentDate: (currentDate) => set({ currentDate }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'agre-billing-app-store',
    }
  )
);
