import { create } from 'zustand';
import type { AuthUser, RoleName } from '@agre/shared/types';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasRole: (role: RoleName) => boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  hasRole: (role) => {
    const { user } = get();
    return user?.roles.includes(role) ?? false;
  },

  hasPermission: (permission) => {
    const { user } = get();
    return user?.permissions.includes(permission) ?? false;
  },

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),
}));
