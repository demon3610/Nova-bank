import { create } from 'zustand';
import type { Notification } from '@/types';

interface UiState {
  sidebarOpen: boolean;
  theme: string;
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: string) => void;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markRead: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setTheme: (theme) => set({ theme }),

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),
}));
