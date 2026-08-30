import { create } from 'zustand';
import type { Company } from '@agre/shared/types';

interface AppState {
  company: Company | null;
  setCompany: (company: Company | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  company: null,
  setCompany: (company) => set({ company }),
}));
