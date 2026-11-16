import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  hydrate: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      set({ isAuthenticated: true, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));
