import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, FinancialYear } from '@agre/shared/types';

interface AppState {
  // Company
  company: Company | null;
  financialYear: FinancialYear | null;

  // Navigation
  currentDate: string; // YYYY-MM-DD
  sidebarCollapsed: boolean;

  // Actions
  setCompany: (company: Company | null) => void;
  setFinancialYear: (fy: FinancialYear | null) => void;
  setCurrentDate: (date: string) => void;
  toggleSidebar: () => void;
}

// Removed DEFAULT_COMPANY

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      company: null,
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
