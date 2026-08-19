import { create } from 'zustand';
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

export const useAppStore = create<AppState>((set) => ({
  company: null,
  financialYear: null,
  currentDate: new Date().toISOString().split('T')[0],
  sidebarCollapsed: false,

  setCompany: (company) => set({ company }),
  setFinancialYear: (financialYear) => set({ financialYear }),
  setCurrentDate: (currentDate) => set({ currentDate }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
